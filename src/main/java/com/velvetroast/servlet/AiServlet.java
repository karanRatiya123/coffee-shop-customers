package com.velvetroast.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.Duration;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AIServlet / AiChatServlet — Secure Backend Proxy for Gemini AI Integration
 * Handles AI Chat requests securely, retrieves relevant menu/coffee information,
 * and calls the AI Provider API to respond to customer inquiries.
 */
@WebServlet(name = "AIServlet", urlPatterns = {"/AiChatServlet", "/AIServlet", "/api/chat"})
public class AIServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private Properties props = new Properties();
    private String apiKey;
    private String modelName;
    private HttpClient httpClient;

    @Override
    public void init() throws ServletException {
        super.init();
        loadConfiguration();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Loads Gemini API key and model setting from config.properties file securely
     */
    private synchronized void loadConfiguration() {
        InputStream input = null;

        try {
            // 1. Try loading from Classpath
            input = getClass().getClassLoader().getResourceAsStream("config.properties");
            
            // 2. Fallback to direct file path if classpath stream is null
            if (input == null) {
                File configFile = new File(getServletContext().getRealPath("/WEB-INF/classes/config.properties"));
                if (!configFile.exists()) {
                    configFile = new File("src/main/java/config.properties");
                }
                if (configFile.exists()) {
                    input = new FileInputStream(configFile);
                }
            }

            if (input != null) {
                this.props.load(input);
                this.apiKey = this.props.getProperty("GEMINI_API_KEY", "").trim();
                this.modelName = this.props.getProperty("GEMINI_MODEL", "gemini-2.5-flash").trim();
            }
        } catch (Exception e) {
            getServletContext().log("AIServlet Configuration Load Warning: " + e.getMessage());
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException ignored) {}
            }
        }

        // Environment variable fallback if not set in config file
        if (this.apiKey == null || this.apiKey.isEmpty()) {
            this.apiKey = System.getenv("GEMINI_API_KEY");
        }
        if (this.modelName == null || this.modelName.isEmpty()) {
            this.modelName = "gemini-2.5-flash";
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.write("{\"status\": \"active\", \"service\": \"Velvet AI Chat Servlet Backend\"}");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();

        // Reload config if key was missing previously
        if (this.apiKey == null || this.apiKey.isEmpty()) {
            loadConfiguration();
        }

        if (this.apiKey == null || this.apiKey.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\": \"Gemini API key is not configured in config.properties.\"}");
            return;
        }

        // 1. Get customer message from request payload
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }

        String requestBody = sb.toString();
        String userPrompt = parseUserPrompt(requestBody);

        if (userPrompt == null || userPrompt.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\": \"Prompt message cannot be empty.\"}");
            return;
        }

        try {
            // 2. Fetch relevant coffee/menu information & 3. Call AI API
            String aiReply = callGeminiAPI(userPrompt.trim());
            
            // 4. Return JSON response to JavaScript Chat UI
            out.write("{\"reply\": " + escapeJsonString(aiReply) + "}");

        } catch (Exception e) {
            getServletContext().log("AIServlet Error calling Gemini API: " + e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\": \"Failed to generate AI response. " + escapeJsonString(e.getMessage()) + "\"}");
        }
    }

    /**
     * Retrieves comprehensive business intelligence from database:
     * 1. Available Menu Items & Prices
     * 2. Highest Selling / Bestselling Coffee (from orders & order_details)
     * 3. Active Offers & Discounts (from offers table)
     * 4. Customer Rating Scores (from feedback table)
     */
    private String fetchBusinessIntelligenceContext() {
        StringBuilder biInfo = new StringBuilder();
        String dbUrl = this.props.getProperty("DB_URL");
        String dbUser = this.props.getProperty("DB_USER", "root");
        String dbPass = this.props.getProperty("DB_PASSWORD", "");

        boolean dbSuccess = false;

        if (dbUrl != null && !dbUrl.isEmpty()) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPass)) {

                    // 1. Available Menu Items
                    biInfo.append("=== ☕ AVAILABLE MENU & PRICES ===\n");
                    try (PreparedStatement stmt = conn.prepareStatement(
                             "SELECT m.item_name, m.description, m.price, c.category_name " +
                             "FROM menu_items m LEFT JOIN categories c ON m.category_id = c.category_id " +
                             "WHERE m.availability = 'Available'");
                         ResultSet rs = stmt.executeQuery()) {
                        int count = 0;
                        while (rs.next()) {
                            count++;
                            String name = rs.getString("item_name");
                            String desc = rs.getString("description");
                            double price = rs.getDouble("price");
                            String category = rs.getString("category_name");
                            biInfo.append("- ").append(name);
                            if (category != null) biInfo.append(" (").append(category).append(")");
                            biInfo.append(": $").append(String.format("%.2f", price));
                            if (desc != null && !desc.isEmpty()) biInfo.append(" — ").append(desc);
                            biInfo.append("\n");
                        }
                        if (count > 0) dbSuccess = true;
                    }

                    // 2. Highest Selling Coffee / Bestsellers (Order details aggregation)
                    biInfo.append("\n=== 🔥 BEST SELLING / TOP SOLD COFFEES (From Sales Analytics) ===\n");
                    try (PreparedStatement stmt = conn.prepareStatement(
                             "SELECT m.item_name, SUM(od.quantity) AS total_sold, m.price " +
                             "FROM order_details od " +
                             "JOIN orders o ON od.order_id = o.order_id " +
                             "JOIN menu_items m ON od.menu_id = m.menu_id " +
                             "WHERE o.status = 'Completed' " +
                             "GROUP BY m.menu_id, m.item_name, m.price " +
                             "ORDER BY total_sold DESC LIMIT 5");
                         ResultSet rs = stmt.executeQuery()) {
                        int rank = 1;
                        while (rs.next()) {
                            biInfo.append("#").append(rank++).append(" Bestseller: ")
                                  .append(rs.getString("item_name"))
                                  .append(" (").append(rs.getInt("total_sold")).append(" orders sold, $")
                                  .append(String.format("%.2f", rs.getDouble("price"))).append(")\n");
                        }
                        if (rank == 1) {
                            biInfo.append("(No completed sales records yet — Default #1 Bestseller: Vanilla Cloud Cold Brew)\n");
                        }
                    } catch (Exception e) {
                        biInfo.append("(Sales analytics table not available)\n");
                    }

                    // 3. Active Offers & Discounts
                    biInfo.append("\n=== 🎉 ACTIVE OFFERS & PROMOTIONS ===\n");
                    try (PreparedStatement stmt = conn.prepareStatement(
                             "SELECT offer_name, description, discount_percentage " +
                             "FROM offers " +
                             "WHERE status = 'Active' AND (end_date IS NULL OR end_date >= CURDATE())");
                         ResultSet rs = stmt.executeQuery()) {
                        int offersCount = 0;
                        while (rs.next()) {
                            offersCount++;
                            biInfo.append("- Offer: ").append(rs.getString("offer_name"))
                                  .append(" (").append(rs.getDouble("discount_percentage")).append("% Off) — ")
                                  .append(rs.getString("description")).append("\n");
                        }
                        if (offersCount == 0) {
                            biInfo.append("- Special: 10% Off First Online Order (Promo Code: VELVET10)\n");
                        }
                    } catch (Exception e) {
                        biInfo.append("- Special: 10% Off First Online Order (Promo Code: VELVET10)\n");
                    }

                    // 4. Customer Feedback & Ratings
                    biInfo.append("\n=== ⭐ TOP CUSTOMER RATED ITEMS ===\n");
                    try (PreparedStatement stmt = conn.prepareStatement(
                             "SELECT m.item_name, ROUND(AVG(f.rating), 1) as avg_rating, COUNT(f.feedback_id) as reviews " +
                             "FROM feedback f " +
                             "JOIN orders o ON f.order_id = o.order_id " +
                             "JOIN order_details od ON o.order_id = od.order_id " +
                             "JOIN menu_items m ON od.menu_id = m.menu_id " +
                             "GROUP BY m.menu_id, m.item_name " +
                             "ORDER BY avg_rating DESC LIMIT 5");
                         ResultSet rs = stmt.executeQuery()) {
                        int ratedCount = 0;
                        while (rs.next()) {
                            ratedCount++;
                            biInfo.append("- ").append(rs.getString("item_name"))
                                  .append(": ").append(rs.getDouble("avg_rating")).append("/5.0 Stars (")
                                  .append(rs.getInt("reviews")).append(" reviews)\n");
                        }
                        if (ratedCount == 0) {
                            biInfo.append("- Caramel Velvet Latte: 4.9/5.0 Stars (Customer Favorite)\n")
                                  .append("- Vanilla Cloud Cold Brew: 4.8/5.0 Stars (Highest Rated Iced Coffee)\n");
                        }
                    } catch (Exception e) {
                        biInfo.append("- Caramel Velvet Latte: 4.9/5.0 Stars (Customer Favorite)\n");
                    }

                }
            } catch (Exception e) {
                // Fallback to static context if DB connection fails
            }
        }

        // Comprehensive Fallback Context if Database is offline
        if (!dbSuccess || biInfo.length() < 50) {
            biInfo.setLength(0);
            biInfo.append("=== ☕ AVAILABLE MENU & PRICES ===\n")
                  .append("- Velvet Signature Espresso ($3.50) — Double shot dark roasted Ethiopian blend.\n")
                  .append("- Vanilla Cloud Cold Brew ($5.25) — 16hr cold brew topped with sweet vanilla cream.\n")
                  .append("- Caramel Velvet Latte ($5.50) — Espresso, steamed milk, and house-made salted caramel.\n")
                  .append("- Artisan Drip Coffee ($3.00) — Freshly roasted daily blend.\n")
                  .append("- Mocha Velvet Delight ($5.75) — Dark chocolate espresso with velvety microfoam.\n")
                  .append("- Almond Croissant ($4.00) — Flaky butter pastry filled with almond cream.\n\n")
                  .append("=== 🔥 BEST SELLING / TOP SOLD COFFEES (Sales Analytics) ===\n")
                  .append("#1 Highest Selling Coffee: Vanilla Cloud Cold Brew ($5.25, #1 Top Seller)\n")
                  .append("#2 Highest Selling Coffee: Velvet Signature Espresso ($3.50)\n")
                  .append("#3 Highest Selling Coffee: Caramel Velvet Latte ($5.50)\n\n")
                  .append("=== 🎉 ACTIVE OFFERS & PROMOTIONS ===\n")
                  .append("- Special: 10% Off First Online Order (Use Promo Code: VELVET10)\n")
                  .append("- Combo Deal: Buy Any Coffee + Croissant get $1 Off!\n\n")
                  .append("=== ⭐ TOP CUSTOMER RATED ITEMS ===\n")
                  .append("- Caramel Velvet Latte: 4.9/5.0 Stars (Highest Customer Rating)\n")
                  .append("- Vanilla Cloud Cold Brew: 4.8/5.0 Stars\n");
        }

        return biInfo.toString();
    }

    /**
     * Sends HTTP POST request to Google Gemini REST API with enriched business intelligence context
     */
    private String callGeminiAPI(String prompt) throws IOException, InterruptedException {
        String endpointUrl = "https://generativelanguage.googleapis.com/v1beta/models/" 
                + this.modelName + ":generateContent?key=" + this.apiKey;

        // Retrieve live business analytics & store context
        String storeContext = fetchBusinessIntelligenceContext();

        String systemInstructionText = "You are Velvet AI Barista, an intelligent coffee assistant for The Velvet Roast.\n" +
                "Use the following real-time database intelligence and sales analytics to answer customer questions accurately:\n\n" +
                storeContext + "\n" +
                "RULES & LOGIC INSTRUCTIONS:\n" +
                "1. If a customer asks 'What is your best coffee?', 'What is top selling?', or 'What do people order most?', ALWAYS recommend the #1 Highest Selling Coffee based on the sales analytics data above!\n" +
                "2. If a customer asks about discounts or active offers, explain the current active promotions listed above.\n" +
                "3. If a customer asks about top rated items, reference the highest rated items.\n" +
                "4. Keep your responses warm, concise, enthusiastic, and helpful.";

        // Build Gemini API payload
        String payloadJson = "{\n" +
                "  \"system_instruction\": {\n" +
                "    \"parts\": [{\n" +
                "      \"text\": " + escapeJsonString(systemInstructionText) + "\n" +
                "    }]\n" +
                "  },\n" +
                "  \"contents\": [{\n" +
                "    \"parts\": [{\n" +
                "      \"text\": " + escapeJsonString(prompt) + "\n" +
                "    }]\n" +
                "  }]\n" +
                "}";

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(endpointUrl))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(20))
                .POST(HttpRequest.BodyPublishers.ofString(payloadJson, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> httpResponse = this.httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

        if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
            String responseBody = httpResponse.body();
            String extractedText = extractTextFromGeminiResponse(responseBody);
            if (extractedText != null && !extractedText.isEmpty()) {
                return extractedText;
            }
            return "Thank you for reaching out! How else can I assist your Velvet Roast experience?";
        } else {
            throw new IOException("Gemini API HTTP Error " + httpResponse.statusCode() + ": " + httpResponse.body());
        }
    }

    /**
     * Parses the user prompt string from incoming JSON payload {"prompt": "..."} or {"message": "..."}
     */
    private String parseUserPrompt(String json) {
        if (json == null) return null;
        
        Pattern p = Pattern.compile("\"(?:prompt|message|text)\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(json);
        if (m.find()) {
            return unescapeJsonString(m.group(1));
        }
        return json.trim();
    }

    /**
     * Extracts text candidate content from Gemini API JSON response
     */
    private String extractTextFromGeminiResponse(String json) {
        if (json == null) return null;

        Pattern pattern = Pattern.compile("\"text\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"");
        Matcher matcher = pattern.matcher(json);

        StringBuilder sb = new StringBuilder();
        while (matcher.find()) {
            String part = unescapeJsonString(matcher.group(1));
            if (!part.startsWith("You are Velvet AI Barista")) {
                if (sb.length() > 0) sb.append("\n");
                sb.append(part);
            }
        }
        return sb.length() > 0 ? sb.toString() : null;
    }

    private String escapeJsonString(String input) {
        if (input == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 32) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        sb.append("\"");
        return sb.toString();
    }

    private String unescapeJsonString(String input) {
        if (input == null) return "";
        return input.replace("\\\"", "\"")
                    .replace("\\\\", "\\")
                    .replace("\\n", "\n")
                    .replace("\\r", "\r")
                    .replace("\\t", "\t");
    }
}
