import { Router, Response } from 'express';
import bcryptjs from 'bcryptjs';
import { supabaseClient, supabaseServiceClient } from '../utils/supabase.ts';
import { generateToken, sendError, sendSuccess, sendCreated, ApiError } from '../utils/jwt.ts';
import { validate, signupSchema, studentVerificationSchema } from '../utils/validation.ts';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { AuthRequest, StudentVerificationRequest } from '../types/index.ts';

const router = Router();

/**
 * POST /api/auth/verify-student
 * Verify if student details exist and match
 */
router.post('/verify-student', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = validate(studentVerificationSchema, req.body);

    // Check if student exists and matches
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('student_id', data.student_id)
      .eq('email', data.email)
      .eq('full_name', data.full_name)
      .single();

    if (studentError || !student) {
      return sendError(res, 404, 'Student details do not match our records');
    }

    if (!student.verified) {
      return sendError(res, 403, 'Student not verified yet. Contact your school administrator.');
    }

    sendSuccess(res, { student_id: student.id }, 'Student verified successfully');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/auth/signup
 * Register new student account
 */
router.post('/signup', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, full_name, student_id } = validate(signupSchema, req.body);

    // Verify student exists
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('student_id', student_id)
      .eq('email', email)
      .eq('full_name', full_name)
      .single();

    if (studentError || !student) {
      return sendError(res, 400, 'Student details do not match our records');
    }

    if (!student.verified) {
      return sendError(res, 403, 'Student account not verified. Contact your administrator.');
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return sendError(res, 409, 'Email already registered');
    }

    // Create auth user
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          student_id: student.id,
        },
      },
    });

    if (authError || !authUser) {
      return sendError(res, 400, authError?.message || 'Failed to create user');
    }

    // Create user record
    const { data: newUser, error: userError } = await supabaseClient
      .from('users')
      .insert({
        student_id: student.id,
        email,
        full_name,
        auth_user_id: authUser.id,
        role: 'student',
      })
      .select()
      .single();

    if (userError || !newUser) {
      return sendError(res, 400, userError?.message || 'Failed to create user profile');
    }

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    sendCreated(res, {
      user: newUser,
      token,
    }, 'Account created successfully');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/auth/dev-login
 * Dev-only quick login for testing (no password required)
 */
router.post('/dev-login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return sendError(res, 403, 'Dev endpoint disabled in production');
    }

    const { email = 'vendor@test.com' } = req.body;

    // Get or create test user
    const { data: user, error: userError } = await supabaseServiceClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let testUser = user;
    if (userError || !user) {
      // Create test vendor
      const { data: newUser, error: createError } = await supabaseServiceClient
        .from('users')
        .insert({
          email,
          full_name: 'Test Vendor',
          role: 'vendor',
          avatar_url: 'https://via.placeholder.com/150?text=Test+Vendor'
        })
        .select('*')
        .single();

      if (createError || !newUser) {
        return sendError(res, 400, `Failed to create test user: ${createError?.message}`);
      }
      testUser = newUser;
    }

    // Generate token
    const token = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    sendSuccess(res, {
      user: testUser,
      token,
    }, 'Dev login successful');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password required');
    }

    // Authenticate with Supabase
    const { data: { session }, error: authError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !session) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Get user profile
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_user_id', session.user.id)
      .single();

    if (userError || !user) {
      return sendError(res, 404, 'User profile not found');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(res, {
      user,
      token,
      session: session.session,
    }, 'Logged in successfully');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return sendError(res, 400, error.message);
    }

    sendSuccess(res, {}, 'Logged out successfully');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    const { data: user, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, user, 'User profile retrieved');
  } catch (error: any) {
    sendError(res, 400, error.message);
  }
});

export default router;
