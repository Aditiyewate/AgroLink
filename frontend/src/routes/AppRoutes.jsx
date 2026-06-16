import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import GovernmentSchemes from '../pages/GovernmentSchemes';

// Dashboard pages
import FarmerDashboard from '../pages/FarmerDashboard';
import BuyerDashboard from '../pages/BuyerDashboard';
import ColdStorageDashboard from '../pages/ColdStorageDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import ProfilePage from '../pages/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/schemes" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <GovernmentSchemes />
          </ProtectedRoute>
        } 
      />

      {/* Farmer Dashboard Protected Routes */}
      <Route 
        path="/farmer" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard tab="dashboard" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farmer/add-product" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard tab="add-product" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farmer/orders" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard tab="orders" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farmer/earnings" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard tab="earnings" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farmer/cold-storage" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard tab="cold-storage" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/farmer/complaints" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard tab="complaints" />
          </ProtectedRoute>
        } 
      />

      {/* Buyer Dashboard Protected Routes */}
      <Route 
        path="/buyer" 
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboard tab="shop" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buyer/cart" 
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboard tab="cart" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buyer/orders" 
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboard tab="orders" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buyer/favorites" 
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboard tab="favorites" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/buyer/complaints" 
        element={
          <ProtectedRoute allowedRoles={['BUYER']}>
            <BuyerDashboard tab="complaints" />
          </ProtectedRoute>
        } 
      />


      {/* Cold Storage Dashboard Protected Routes */}
      <Route 
        path="/storage" 
        element={
          <ProtectedRoute allowedRoles={['COLD_STORAGE_MANAGER']}>
            <ColdStorageDashboard tab="overview" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/storage/requests" 
        element={
          <ProtectedRoute allowedRoles={['COLD_STORAGE_MANAGER']}>
            <ColdStorageDashboard tab="requests" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/storage/records" 
        element={
          <ProtectedRoute allowedRoles={['COLD_STORAGE_MANAGER']}>
            <ColdStorageDashboard tab="records" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/storage/complaints" 
        element={
          <ProtectedRoute allowedRoles={['COLD_STORAGE_MANAGER']}>
            <ColdStorageDashboard tab="complaints" />
          </ProtectedRoute>
        } 
      />

      {/* Admin Dashboard Protected Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard tab="dashboard" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard tab="users" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard tab="products" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/complaints" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard tab="complaints" />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/mandi" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard tab="mandi" />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'BUYER', 'COLD_STORAGE_MANAGER', 'ADMIN']}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
