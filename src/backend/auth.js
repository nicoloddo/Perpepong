/**
 * Authentication Module
 * Handles user authentication using Supabase Auth
 * 
 * PURE COMPUTATION ONLY - No DOM manipulation
 * This module exports functions that interact with Supabase Auth API
 */

import { supabase } from './supabase.js';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error('Sign up error:', error);
            return { data: null, error };
        }

        console.log('User signed up successfully:', data.user?.email);
        return { data, error: null };
    } catch (error) {
        console.error('Unexpected sign up error:', error);
        return { data: null, error };
    }
}

/**
 * Sign in a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function signInWithPassword(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Sign in error:', error);
            return { data: null, error };
        }

        console.log('User signed in successfully:', data.user?.email);
        return { data, error: null };
    } catch (error) {
        console.error('Unexpected sign in error:', error);
        return { data: null, error };
    }
}

/**
 * Sign in with Google OAuth
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function signInWithGoogle() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + window.getPath('/')
            }
        });

        if (error) {
            console.error('Google sign in error:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (error) {
        console.error('Unexpected Google sign in error:', error);
        return { data: null, error };
    }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Object|null}>}
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Sign out error:', error);
            return { error };
        }

        console.log('User signed out successfully');
        return { error: null };
    } catch (error) {
        console.error('Unexpected sign out error:', error);
        return { error };
    }
}

/**
 * Get the current authenticated user
 * @returns {Promise<{user: Object|null, error: Object|null}>}
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Get user error:', error);
            return { user: null, error };
        }

        return { user, error: null };
    } catch (error) {
        console.error('Unexpected get user error:', error);
        return { user: null, error };
    }
}

/**
 * Get the current session
 * @returns {Promise<{session: Object|null, error: Object|null}>}
 */
export async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Get session error:', error);
            return { session: null, error };
        }

        return { session, error: null };
    } catch (error) {
        console.error('Unexpected get session error:', error);
        return { session: null, error };
    }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function that receives (event, session)
 * @returns {Object} Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        callback(event, session);
    });

    return subscription;
}

/**
 * Check if user is currently authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
    const { user } = await getCurrentUser();
    return user !== null;
}
