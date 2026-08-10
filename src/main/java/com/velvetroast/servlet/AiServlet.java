package com.velvetroast.servlet;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.velvetroast.util.DbUtil;
import com.velvetroast.util.ConfigUtil;

@WebServlet("/AiServlet")
public class AiServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // Resilient static fallback catalog if database is empty or unavailable
    private static final String FALLBACK_MENU = 
        "1. Espresso - ₹120. Rich, bold, and concentrated. (Category: Coffee, Vegan, Dairy-Free, Gluten-Free)\n" +
        "2. Americano - ₹150. Espresso shots topped with hot water, smooth and full-bodied. (Category: Coffee, Vegan, Dairy-Free)\n" +
        "3. Cafe Latte - ₹180. Rich espresso with steamed milk and a thin layer of foam. (Category: Coffee, Vegetarian)\n" +
        "4. Cappuccino - ₹180. Balanced espresso, steamed milk, and a thick layer of velvety foam. (Category: Coffee, Vegetarian)\n" +
        "5. Flat White - ₹190. Espresso with microfoam milk for a strong, creamy texture. (Category: Coffee, Vegetarian)\n" +
        "6. Caramel Macchiato - ₹210. Vanilla syrup, steamed milk, espresso, and butter-caramel drizzle. (Category: Coffee, Vegetarian)\n" +
        "7. Velvet Mocha - ₹220. Rich espresso, dark chocolate sauce, steamed milk, and whipped cream. (Category: Coffee, Vegetarian)\n" +
        "8. Pour Over - ₹240. Hand-brewed single-origin specialty coffee, clean and intricate. (Category: Coffee, Vegan, Dairy-Free)\n" +
        "9. Cold Brew - ₹180. Slow-steeped for 16 hours, ultra-smooth and low acidity. (Category: Coffee, Vegan, Dairy-Free)\n" +
        "10. Velvet Croissant - ₹140. Flaky, buttery baked fresh daily. (Category: Pastry, Vegetarian)\n" +
        "11. Cinnamon Roll - ₹160. Warm, soft cinnamon roll with cream cheese frosting. (Category: Pastry, Vegetarian)\n" +
        "12. Almond Muffin - ₹150. Moist muffin packed with toasted almond slices. (Category: Pastry, Vegetarian)\n";

    private static final String FALLBACK_OFFERS = 
        "1. VELVET10 - 10% off on your first order. (Active)\n" +
        "2. BREW20 - 20% off on orders above ₹500. (Active)\n" +
        "3. MORNING50 - ₹50 off on orders placed before 10:00 AM (Min spend ₹300). (Active)\n";

    private static final String FALLBACK_CUSTOMIZATIONS = 
        "Sizes:\n" +
        "- Regular (Included in base price)\n" +
        "- Large (+₹30)\n" +
        "Milk Options:\n" +
        "- Whole Milk (Included)\n" +
        "- Oat Milk (+₹40, Vegan/Dairy-Free)\n" +
        "- Almond Milk (+₹40, Vegan/Dairy-Free)\n" +
        "Add-ons:\n" +
        "- Extra Espresso Shot (+₹50)\n" +
        "- Caramel / Vanilla / Hazelnut Syrup (+₹30)\n" +
        "- Sugar-free Sweetener (Free)\n";

    @Override
    public void init() throws ServletException {
        super.init();
        ConfigUtil.loadFromServletContext(getServletContext());
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // 1. Read the JSON body from the client request
        StringBuilder jsonBuffer = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                jsonBuffer.append(line);
            }
        }

        String requestBody = jsonBuffer.toString();
        
        // Extract the user message and history using regex for light parsing
        String userMessage = extractJsonStringField(requestBody, "message");
        String chatHistoryJson = extractJsonArrayField(requestBody, "history");

        if (userMessage == null || userMessage.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"Missing 'message' parameter.\"}");
            return;
        }

        // 2. Load menu and offer context dynamically from the database
        String menuContext = getMenuContextFromDb();
        String offersContext = getOffersContextFromDb();

        // 3. Obtain the Gemini API key securely
        String apiKey = ConfigUtil.get("GEMINI_API_KEY", "GEMINI_API_KEY");
        String geminiModel = ConfigUtil.get("GEMINI_MODEL", "GEMINI_MODEL", "gemini-2.0-flash");

        if (apiKey == null || apiKey.trim().isEmpty()) {
            // For safety and debug, log it, but do not leak or fail completely. Give a friendly message.
            System.err.println("[AiServlet] GEMINI_API_KEY is not set. AI functions will fall back to message.");
            response.getWriter().write("{\"reply\": \"Welcome to The Velvet Roast! [Demo Mode] (Please set the GEMINI_API_KEY environment variable on your server to enable live AI chat replies). You asked: '" + userMessage + "'\"}");
            return;
        }
        System.out.println("[AiServlet] Using Gemini model: " + geminiModel + " (api key length=" + apiKey.length() + ")");

        // 4. Construct System Instruction for Gemini
        String systemInstruction = 
            "You are 'Velvet Barista', the friendly, elegant AI assistant for 'The Velvet Roast' artisan coffee shop. " +
            "Your goal is to help customers browse the menu, customize drinks, understand dietary options, and decide what to order. " +
            "Follow these strict rules:\n" +
            "1. ONLY recommend coffee, food items, custom options, prices, and offers that exist in the provided catalog below. " +
            "Do NOT invent menu items, pastries, or customize prices that are not listed.\n" +
            "2. Keep prices in Indian Rupees (₹) as listed in the catalog.\n" +
            "3. Help customers customize milk (Oat/Almond +₹40, Whole milk) or sizing (Regular, Large +₹30) based on catalog rules.\n" +
            "4. Suggest drinks within a budget using the actual prices (e.g. if budget is ₹150, recommend Espresso or Americano or Cold Brew).\n" +
            "5. Answer dietary questions strictly using the dietary tags in the catalog (e.g., mention which items are Vegan, Dairy-Free, or Vegetarian).\n" +
            "6. Recommend active offers if appropriate (e.g., VELVET10, BREW20, MORNING50).\n" +
            "7. Explain menu items naturally and passionately, describing their taste profile.\n" +
            "8. Chat naturally, politely, and keep your responses conversational but concise.\n" +
            "9. NEVER directly modify orders or add items to the cart. Instead, say something like: 'I recommend the Velvet Mocha with Oat Milk! You can add it to your order by clicking the Order page.'\n\n" +
            "Here is the LIVE menu catalog of The Velvet Roast:\n" +
            menuContext + "\n" +
            "Here are the active custom options & add-ons:\n" +
            FALLBACK_CUSTOMIZATIONS + "\n" +
            "Here are the active discount coupon offers:\n" +
            offersContext;

        // 5. Build Gemini Request Payload
        String geminiPayload = buildGeminiPayload(systemInstruction, chatHistoryJson, userMessage);

        // 6. Make POST call to Gemini API
        try {
            HttpClient httpClient = HttpClient.newHttpClient();
            HttpRequest geminiRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(geminiPayload))
                    .build();

            HttpResponse<String> geminiResponse = httpClient.send(geminiRequest, HttpResponse.BodyHandlers.ofString());

            if (geminiResponse.statusCode() == 200) {
                String responseBody = geminiResponse.body();
                String aiReply = extractGeminiText(responseBody);

                // Escape response for JSON
                String escapedReply = escapeJsonString(aiReply);
                response.getWriter().write("{\"reply\": \"" + escapedReply + "\"}");
            } else {
                String body = geminiResponse.body();
                System.err.println("[AiServlet] Gemini API error. Status: " + geminiResponse.statusCode() + ", Body: " + body);
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                // Surface a short, useful error code so the client (and Tomcat logs) tell you *why* it failed.
                response.getWriter().write("{\"error\": \"Our brewing systems are busy. Please try asking again shortly!\", \"status\": " + geminiResponse.statusCode() + ", \"hint\": \"" + friendlyHint(geminiResponse.statusCode()) + "\"}");
            }

        } catch (Exception e) {
            System.err.println("[AiServlet] Request failed: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Our brewing systems are busy. Please try asking again shortly!\", \"detail\": \"" + escapeJsonString(String.valueOf(e.getMessage())) + "\"}");
        }
    }

    // Translate raw Gemini HTTP statuses into something readable in the browser console.
    private String friendlyHint(int status) {
        switch (status) {
            case 400: return "Bad request (check system instruction payload).";
            case 401: return "Invalid API key.";
            case 403: return "API key lacks permission or region not enabled.";
            case 404: return "Model not found. Update GEMINI_MODEL in config.properties.";
            case 429: return "Rate limit hit. Try again in a few seconds.";
            default:  return "Upstream error.";
        }
    }

    // Helper: Retrieve menu list from Database (or use fallback)
    private String getMenuContextFromDb() {
        StringBuilder sb = new StringBuilder();
        String query = "SELECT m.item_name, m.price, m.description, m.availability, c.category_name " +
                       "FROM menu_items m " +
                       "LEFT JOIN categories c ON m.category_id = c.category_id " +
                       "WHERE m.availability = 'Available'";
        
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            
            boolean hasData = false;
            while (rs.next()) {
                hasData = true;
                String name = rs.getString("item_name");
                double price = rs.getDouble("price");
                String desc = rs.getString("description");
                String category = rs.getString("category_name");
                
                sb.append("- ").append(name)
                  .append(" - ₹").append(price);
                if (category != null) {
                    sb.append(" (Category: ").append(category).append(")");
                }
                if (desc != null && !desc.trim().isEmpty()) {
                    sb.append(". ").append(desc);
                }
                sb.append("\n");
            }
            
            if (hasData) {
                return sb.toString();
            }
        } catch (Exception e) {
            System.err.println("[AiServlet] Database connection failed or empty menu. Using fallback menu: " + e.getMessage());
        }
        
        return FALLBACK_MENU;
    }

    // Helper: Retrieve offers list from Database (or use fallback)
    private String getOffersContextFromDb() {
        StringBuilder sb = new StringBuilder();
        String query = "SELECT offer_name, description, discount_percentage, status FROM offers WHERE status = 'Active'";
        
        try (Connection conn = DbUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            
            boolean hasData = false;
            while (rs.next()) {
                hasData = true;
                String name = rs.getString("offer_name");
                String desc = rs.getString("description");
                double pct = rs.getDouble("discount_percentage");
                
                sb.append("- ").append(name)
                  .append(": ").append(pct).append("% off");
                if (desc != null && !desc.trim().isEmpty()) {
                    sb.append(" (").append(desc).append(")");
                }
                sb.append("\n");
            }
            
            if (hasData) {
                return sb.toString();
            }
        } catch (Exception e) {
            System.err.println("[AiServlet] Database connection failed or empty offers. Using fallback offers: " + e.getMessage());
        }
        
        return FALLBACK_OFFERS;
    }

    // Helper: Extract string value from JSON
    private String extractJsonStringField(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + fieldName + "\"\\s*:\\s*\"([^\"]*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    // Helper: Extract JSON array contents using simple regex
    private String extractJsonArrayField(String json, String fieldName) {
        int index = json.indexOf("\"" + fieldName + "\"");
        if (index == -1) return null;
        
        int startBracket = json.indexOf("[", index);
        if (startBracket == -1) return null;
        
        // Find matching closing bracket
        int count = 1;
        for (int i = startBracket + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '[') count++;
            else if (c == ']') count--;
            
            if (count == 0) {
                return json.substring(startBracket, i + 1);
            }
        }
        return null;
    }

    // Helper: Construct Request Payload for Gemini REST API
    private String buildGeminiPayload(String systemInstruction, String chatHistoryJson, String currentMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        
        // 1. Add System Instruction
        sb.append("\"systemInstruction\": {");
        sb.append("\"parts\": [");
        sb.append("{\"text\": \"").append(escapeJsonString(systemInstruction)).append("\"}");
        sb.append("]");
        sb.append("},");
        
        // 2. Add contents (chat history + new message)
        sb.append("\"contents\": [");
        
        boolean hasHistory = false;
        if (chatHistoryJson != null && chatHistoryJson.length() > 2) {
            // Attempt to parse history objects. Format: [{"role":"user","parts":[{"text":"hi"}]}]
            // Since we receive it formatted, we can inject the history parts directly
            String historyContent = chatHistoryJson.trim();
            // Remove outer brackets
            if (historyContent.startsWith("[") && historyContent.endsWith("]")) {
                String inner = historyContent.substring(1, historyContent.length() - 1).trim();
                if (!inner.isEmpty()) {
                    sb.append(inner).append(",");
                    hasHistory = true;
                }
            }
        }
        
        // Append the current turn
        sb.append("{\"role\": \"user\", \"parts\": [{\"text\": \"").append(escapeJsonString(currentMessage)).append("\"}]}");
        
        sb.append("]");
        sb.append("}");
        
        return sb.toString();
    }

    // Helper: Extract text response from Gemini generateContent JSON
    private String extractGeminiText(String json) {
        // Look for the "text" field inside content/parts
        // Response format: {"candidates": [{"content": {"parts": [{"text": "REPLY_HERE"}]}}]}
        Pattern pattern = Pattern.compile("\"text\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String rawText = matcher.group(1);
            // Decode escaped unicode and quotes
            return unescapeJsonString(rawText);
        }
        return "Sorry, I couldn't process that response.";
    }

    // Helper: Simple JSON string escape
    private String escapeJsonString(String str) {
        if (str == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < str.length(); i++) {
            char ch = str.charAt(i);
            switch (ch) {
                case '"':
                    sb.append("\\\"");
                    break;
                case '\\':
                    sb.append("\\\\");
                    break;
                case '\b':
                    sb.append("\\b");
                    break;
                case '\f':
                    sb.append("\\f");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                default:
                    // Reference check for control characters
                    if (ch < ' ') {
                        String hex = Integer.toHexString(ch);
                        sb.append("\\u00").append("0000".substring(hex.length())).append(hex);
                    } else {
                        sb.append(ch);
                    }
                    break;
            }
        }
        return sb.toString();
    }

    // Helper: Simple JSON string unescape
    private String unescapeJsonString(String str) {
        if (str == null) return "";
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < str.length()) {
            char ch = str.charAt(i);
            if (ch == '\\' && i + 1 < str.length()) {
                char next = str.charAt(i + 1);
                switch (next) {
                    case '"': sb.append('"'); i += 2; break;
                    case '\\': sb.append('\\'); i += 2; break;
                    case '/': sb.append('/'); i += 2; break;
                    case 'b': sb.append('\b'); i += 2; break;
                    case 'f': sb.append('\f'); i += 2; break;
                    case 'n': sb.append('\n'); i += 2; break;
                    case 'r': sb.append('\r'); i += 2; break;
                    case 't': sb.append('\t'); i += 2; break;
                    case 'u':
                        if (i + 5 < str.length()) {
                            String hex = str.substring(i + 2, i + 6);
                            sb.append((char) Integer.parseInt(hex, 16));
                            i += 6;
                        } else {
                            sb.append(ch);
                            i++;
                        }
                        break;
                    default:
                        sb.append(ch);
                        i++;
                        break;
                }
            } else {
                sb.append(ch);
                i++;
            }
        }
        return sb.toString();
    }
}
