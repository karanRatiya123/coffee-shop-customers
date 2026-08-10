package com.velvetroast.util;

import jakarta.servlet.ServletContext;
import java.io.InputStream;
import java.util.Properties;

/**
 * Utility for loading configuration properties securely from various sources:
 * 1. System environment variables
 * 2. Java system properties
 * 3. Classpath resource (config.properties)
 * 4. WEB-INF resource (config.properties)
 */
public class ConfigUtil {
    private static final Properties properties = new Properties();

    static {
        // Load from classpath first
        try (InputStream input = ConfigUtil.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input != null) {
                properties.load(input);
                System.out.println("[ConfigUtil] Loaded config.properties from classpath successfully.");
            }
        } catch (Exception e) {
            System.err.println("[ConfigUtil] Note: config.properties could not be loaded from classpath: " + e.getMessage());
        }
    }

    /**
     * Lazy load properties from ServletContext if they are not already loaded.
     * This allows loading from /WEB-INF/config.properties dynamically.
     * @param context ServletContext
     */
    public static synchronized void loadFromServletContext(ServletContext context) {
        if (context == null) return;
        
        // Only load if not already populated from classpath
        if (properties.isEmpty() || properties.getProperty("GEMINI_API_KEY") == null) {
            try (InputStream input = context.getResourceAsStream("/WEB-INF/config.properties")) {
                if (input != null) {
                    properties.load(input);
                    System.out.println("[ConfigUtil] Loaded config.properties from ServletContext (/WEB-INF/config.properties) successfully.");
                }
            } catch (Exception e) {
                System.err.println("[ConfigUtil] Note: config.properties could not be loaded from WEB-INF: " + e.getMessage());
            }
        }
    }

    /**
     * Retrieve configuration value with priority:
     * 1. Environment Variable (envName)
     * 2. System Property (envName)
     * 3. Properties File key (key)
     * 4. Default Value (defaultValue)
     */
    public static String get(String key, String envName, String defaultValue) {
        // 1. Check System Environment Variable
        String value = System.getenv(envName);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }

        // 2. Check Java System Property
        value = System.getProperty(envName);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }

        // 3. Check loaded properties file
        value = properties.getProperty(key);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }

        return defaultValue;
    }

    /**
     * Retrieve configuration value with priority and null fallback.
     */
    public static String get(String key, String envName) {
        return get(key, envName, null);
    }
}
