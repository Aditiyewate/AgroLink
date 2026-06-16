package com.rtech.agrolink.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.rtech.agrolink.dto.OrderDTO;
import com.rtech.agrolink.service.OrderService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/buyer/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private OrderService orderService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestParam BigDecimal amount) {
        BigDecimal amountInPaise = amount.multiply(BigDecimal.valueOf(100));
        
        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise.longValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
            
            Order order = razorpayClient.orders.create(orderRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", keyId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Razorpay client failed: " + e.getMessage());
            return ResponseEntity.badRequest().body("Razorpay order creation failed: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request,
            Authentication authentication) {
        try {
            // ── COD flow: no signature verification required ──
            boolean isCOD = "COD".equalsIgnoreCase(request.getPaymentMethod());
            boolean isValidSignature = isCOD;

            if (!isValidSignature) {
                String secret = keySecret;
                String generatedSignature = hmacSha256(
                        request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId(), secret);
                isValidSignature = generatedSignature.equals(request.getRazorpaySignature());
            }

            if (isValidSignature) {
                // Signature is valid or COD — persist order details to DB
                if (request.getOrders() != null && !request.getOrders().isEmpty()) {
                    OrderDTO lastPlaced = null;
                    for (OrderDTO dto : request.getOrders()) {
                        lastPlaced = orderService.placeOrder(dto, authentication.getName());
                    }
                    return ResponseEntity.ok(lastPlaced);
                } else if (request.getOrderDTO() != null) {
                    OrderDTO placedOrder = orderService.placeOrder(request.getOrderDTO(), authentication.getName());
                    return ResponseEntity.ok(placedOrder);
                } else {
                    return ResponseEntity.badRequest().body("No order details provided in the request!");
                }
            } else {
                return ResponseEntity.badRequest().body("Payment signature verification failed!");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment validation failed: " + e.getMessage());
        }
    }

    private String hmacSha256(String data, String key) throws Exception {
        javax.crypto.Mac sha256_HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
        javax.crypto.spec.SecretKeySpec secret_key = new javax.crypto.spec.SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] rawHmac = sha256_HMAC.doFinal(data.getBytes("UTF-8"));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : rawHmac) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public static class PaymentVerificationRequest {
        private String razorpayPaymentId;
        private String razorpayOrderId;
        private String razorpaySignature;
        private String paymentMethod; // "razorpay" | "COD"
        private OrderDTO orderDTO;
        private java.util.List<OrderDTO> orders;

        public PaymentVerificationRequest() {}

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public OrderDTO getOrderDTO() { return orderDTO; }
        public void setOrderDTO(OrderDTO orderDTO) { this.orderDTO = orderDTO; }

        public java.util.List<OrderDTO> getOrders() { return orders; }
        public void setOrders(java.util.List<OrderDTO> orders) { this.orders = orders; }
    }
}
