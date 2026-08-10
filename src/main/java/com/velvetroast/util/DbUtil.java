package com.velvetroast.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbUtil {
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/coffee_shope_system?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "";

    static {
        try {
            // Register MySQL JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[DbUtil] MySQL JDBC Driver not found: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        String url = ConfigUtil.get("DB_URL", "DB_URL", DEFAULT_URL);
        String user = ConfigUtil.get("DB_USER", "DB_USER", DEFAULT_USER);
        String password = ConfigUtil.get("DB_PASSWORD", "DB_PASSWORD", DEFAULT_PASSWORD);

        return DriverManager.getConnection(url, user, password);
    }
}
