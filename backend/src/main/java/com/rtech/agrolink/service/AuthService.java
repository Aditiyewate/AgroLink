package com.rtech.agrolink.service;

import com.rtech.agrolink.config.JwtUtils;
import com.rtech.agrolink.dto.JwtResponse;
import com.rtech.agrolink.dto.LoginRequest;
import com.rtech.agrolink.dto.RegisterRequest;
import com.rtech.agrolink.dto.ProfileDTO;
import com.rtech.agrolink.dto.ProfileUpdateRequest;
import com.rtech.agrolink.entity.Buyer;
import com.rtech.agrolink.entity.ColdStorage;
import com.rtech.agrolink.entity.Farmer;
import com.rtech.agrolink.entity.User;
import com.rtech.agrolink.repository.BuyerRepository;
import com.rtech.agrolink.repository.ColdStorageRepository;
import com.rtech.agrolink.repository.FarmerRepository;
import com.rtech.agrolink.repository.UserRepository;
import com.rtech.agrolink.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private BuyerRepository buyerRepository;

    @Autowired
    private ColdStorageRepository coldStorageRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private NotificationService notificationService;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String email = loginRequest.getEmail() != null ? loginRequest.getEmail().trim().toLowerCase() : "";
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        User dbUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user credentials not found in DB!"));

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), role, dbUser.getProfilePhoto());
    }

    @Transactional
    public String registerUser(RegisterRequest signUpRequest) {
        String email = signUpRequest.getEmail() != null ? signUpRequest.getEmail().trim().toLowerCase() : "";
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setEmail(email);
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole().toUpperCase());
        user.setActive(true);
        user.setProfilePhoto(signUpRequest.getProfilePhoto());

        user = userRepository.save(user);

        // Based on user role, create respective profile using domain creation validation
        String role = signUpRequest.getRole().toUpperCase();
        if ("FARMER".equals(role)) {
            Farmer farmer = Farmer.createAndValidate(
                user,
                signUpRequest.getName(),
                signUpRequest.getPhone(),
                signUpRequest.getState(),
                signUpRequest.getDistrict(),
                signUpRequest.getFarmSizeAcres(),
                signUpRequest.getUpiId()
            );
            farmerRepository.save(farmer);
        } else if ("BUYER".equals(role)) {
            Buyer buyer = Buyer.createAndValidate(
                user,
                signUpRequest.getCompanyName(),
                signUpRequest.getName(),
                signUpRequest.getPhone(),
                signUpRequest.getAddress(),
                signUpRequest.getGstin()
            );
            buyerRepository.save(buyer);
        } else if ("COLD_STORAGE_MANAGER".equals(role)) {
            ColdStorage storage = ColdStorage.createAndValidate(
                user,
                signUpRequest.getStorageName(),
                signUpRequest.getStorageLocation(),
                signUpRequest.getStorageCapacityTons(),
                signUpRequest.getStoragePricePerTonDay(),
                signUpRequest.getStorageDescription()
            );
            coldStorageRepository.save(storage);
        }

        notificationService.sendToAdmin(
            "New User Registered",
            String.format("A new %s profile (#USR-%d) has registered with email %s.", role, user.getId(), user.getEmail()),
            "SYSTEM"
        );

        return "User registered successfully!";
    }

    public ProfileDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        ProfileDTO dto = new ProfileDTO();
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setProfilePhoto(user.getProfilePhoto());

        String role = user.getRole();
        if ("FARMER".equals(role)) {
            Optional<Farmer> farmerOpt = farmerRepository.findByUserEmail(email);
            if (farmerOpt.isPresent()) {
                Farmer farmer = farmerOpt.get();
                dto.setName(farmer.getName());
                dto.setPhone(farmer.getPhone());
                dto.setState(farmer.getState());
                dto.setDistrict(farmer.getDistrict());
                dto.setFarmSizeAcres(farmer.getFarmSizeAcres());
                dto.setUpiId(farmer.getUpiId());
            }
        } else if ("BUYER".equals(role)) {
            Optional<Buyer> buyerOpt = buyerRepository.findByUserEmail(email);
            if (buyerOpt.isPresent()) {
                Buyer buyer = buyerOpt.get();
                dto.setCompanyName(buyer.getCompanyName());
                dto.setName(buyer.getRepresentativeName());
                dto.setPhone(buyer.getPhone());
                dto.setAddress(buyer.getAddress());
                dto.setGstin(buyer.getGstin());
            }
        } else if ("COLD_STORAGE_MANAGER".equals(role)) {
            Optional<ColdStorage> storageOpt = coldStorageRepository.findByManagerEmail(email);
            if (storageOpt.isPresent()) {
                ColdStorage storage = storageOpt.get();
                dto.setStorageName(storage.getName());
                dto.setStorageLocation(storage.getLocation());
                dto.setStorageCapacityTons(storage.getTotalCapacityTons());
                dto.setStoragePricePerTonDay(storage.getPricePerTonDay());
                dto.setStorageDescription(storage.getDescription());
            }
        }
        return dto;
    }

    @Transactional
    public void updateProfile(String email, ProfileUpdateRequest dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found!"));

        user.setProfilePhoto(dto.getProfilePhoto());
        userRepository.save(user);

        String role = user.getRole();
        if ("FARMER".equals(role)) {
            Farmer farmer = farmerRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Error: Farmer profile not found!"));
            farmer.updateDetails(dto.getName(), dto.getPhone(), dto.getState(), dto.getDistrict(), dto.getFarmSizeAcres(), dto.getUpiId());
            farmerRepository.save(farmer);
        } else if ("BUYER".equals(role)) {
            Buyer buyer = buyerRepository.findByUserEmail(email)
                    .orElseThrow(() -> new RuntimeException("Error: Buyer profile not found!"));
            buyer.updateDetails(dto.getCompanyName(), dto.getName(), dto.getPhone(), dto.getAddress(), dto.getGstin());
            buyerRepository.save(buyer);
        } else if ("COLD_STORAGE_MANAGER".equals(role)) {
            ColdStorage storage = coldStorageRepository.findByManagerEmail(email)
                    .orElseThrow(() -> new RuntimeException("Error: Cold storage profile not found!"));
            storage.updateDetails(dto.getStorageName(), dto.getStorageLocation(), dto.getStorageCapacityTons(), dto.getStoragePricePerTonDay(), dto.getStorageDescription());
            coldStorageRepository.save(storage);
        }
    }
}
