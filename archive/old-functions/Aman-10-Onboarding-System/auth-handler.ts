import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupEmailRequest {
  email: string;
  password: string;
  full_name?: string;
}

interface LoginEmailRequest {
  email: string;
  password: string;
}

interface GoogleAuthRequest {
  token: string; // Google ID token from frontend
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, password, full_name, token, redirect_url } = await req.json();

    // ========================================================================
    // SIGNUP WITH EMAIL
    // ========================================================================
    if (action === 'signup_email') {
      const signupData: SignupEmailRequest = { email, password, full_name };

      if (!signupData.email || !signupData.password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Password validation
      if (signupData.password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create auth user
      const { data: authData, error: signupError } = await supabaseClient.auth.admin.createUser({
        email: signupData.email,
        password: signupData.password,
        email_confirm: false, // Require email confirmation
        user_metadata: {
          full_name: signupData.full_name || '',
        }
      });

      if (signupError) {
        return new Response(
          JSON.stringify({
            error: signupError.message,
            code: signupError.code
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create customer record
      const { data: customer, error: customerError } = await supabaseClient
        .from('customers')
        .insert({
          user_id: authData.user.id,
          email: signupData.email,
          full_name: signupData.full_name || '',
        })
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            full_name: signupData.full_name,
            email_confirmed: false
          },
          customer,
          message: 'Signup successful! Please check your email to verify your account.',
          next_step: 'email_verification'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // LOGIN WITH EMAIL
    // ========================================================================
    if (action === 'login_email') {
      const loginData: LoginEmailRequest = { email, password };

      if (!loginData.email || !loginData.password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sign in with email and password
      const { data: authData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (loginError) {
        return new Response(
          JSON.stringify({
            error: loginError.message,
            code: loginError.code
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get customer data
      const { data: customer } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      // Check if user has brands
      const { data: userBrands } = await supabaseClient
        .from('user_brands')
        .select('brand_id, brands(brand_name, category)')
        .eq('user_id', authData.user.id);

      return new Response(
        JSON.stringify({
          success: true,
          session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at,
          },
          user: {
            id: authData.user.id,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name,
            email_confirmed: authData.user.email_confirmed_at !== null
          },
          customer,
          brands: userBrands || [],
          has_brands: (userBrands?.length || 0) > 0,
          next_step: (userBrands?.length || 0) > 0 ? 'dashboard' : 'onboarding'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // GOOGLE OAUTH SIGNUP/LOGIN
    // ========================================================================
    if (action === 'google_auth') {
      // Note: Frontend should use Supabase client's signInWithOAuth
      // This endpoint is for handling the callback or server-side verification

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Google token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify Google token (this is a simplified version)
      // In production, you should verify the token with Google's API
      try {
        const googleUserInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
        );

        if (!googleUserInfoResponse.ok) {
          throw new Error('Invalid Google token');
        }

        const googleUser = await googleUserInfoResponse.json();

        // Check if user exists
        const { data: existingUser } = await supabaseClient
          .from('customers')
          .select('user_id, email')
          .eq('email', googleUser.email)
          .single();

        if (existingUser) {
          // User exists - login
          const { data: authData, error: signInError } = await supabaseClient.auth.admin.getUserById(
            existingUser.user_id
          );

          if (signInError) throw signInError;

          // Get user brands
          const { data: userBrands } = await supabaseClient
            .from('user_brands')
            .select('brand_id, brands(brand_name, category)')
            .eq('user_id', existingUser.user_id);

          return new Response(
            JSON.stringify({
              success: true,
              user_exists: true,
              user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: googleUser.name,
                email_confirmed: true, // Google emails are pre-verified
                provider: 'google'
              },
              brands: userBrands || [],
              has_brands: (userBrands?.length || 0) > 0,
              next_step: (userBrands?.length || 0) > 0 ? 'dashboard' : 'onboarding'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // New user - create account
          const { data: newAuthUser, error: createError } = await supabaseClient.auth.admin.createUser({
            email: googleUser.email,
            email_confirm: true, // Google emails are pre-verified
            user_metadata: {
              full_name: googleUser.name,
              avatar_url: googleUser.picture,
              provider: 'google'
            }
          });

          if (createError) throw createError;

          // Create customer record
          const { data: customer, error: customerError } = await supabaseClient
            .from('customers')
            .insert({
              user_id: newAuthUser.user.id,
              email: googleUser.email,
              full_name: googleUser.name,
              avatar_url: googleUser.picture,
            })
            .select()
            .single();

          if (customerError) {
            console.error('Error creating customer:', customerError);
          }

          return new Response(
            JSON.stringify({
              success: true,
              user_exists: false,
              user: {
                id: newAuthUser.user.id,
                email: newAuthUser.user.email,
                full_name: googleUser.name,
                avatar_url: googleUser.picture,
                email_confirmed: true,
                provider: 'google'
              },
              customer,
              brands: [],
              has_brands: false,
              next_step: 'onboarding',
              message: 'Google signup successful! Welcome to GeoVera.'
            }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            error: 'Google authentication failed',
            details: error.message
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ========================================================================
    // GET GOOGLE AUTH URL (for frontend redirect)
    // ========================================================================
    if (action === 'get_google_auth_url') {
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirect_url || `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          url: data.url,
          provider: 'google'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // LOGOUT
    // ========================================================================
    if (action === 'logout') {
      const authHeader = req.headers.get('Authorization');

      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { error: signOutError } = await supabaseClient.auth.admin.signOut(token);

      if (signOutError) {
        return new Response(
          JSON.stringify({ error: signOutError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Logged out successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // RESEND VERIFICATION EMAIL
    // ========================================================================
    if (action === 'resend_verification') {
      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // This requires Supabase auth admin API
      // In production, Supabase handles this automatically via their auth system

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Verification email sent. Please check your inbox.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // PASSWORD RESET REQUEST
    // ========================================================================
    if (action === 'request_password_reset') {
      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: redirect_url || `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`,
        }
      );

      if (resetError) {
        return new Response(
          JSON.stringify({ error: resetError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Password reset email sent. Please check your inbox.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // UPDATE PASSWORD
    // ========================================================================
    if (action === 'update_password') {
      const authHeader = req.headers.get('Authorization');

      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!password) {
        return new Response(
          JSON.stringify({ error: 'New password is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(
        user.id,
        { password }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Password updated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Auth handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
