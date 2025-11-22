import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * DELETE /api/auth/delete
 * 
 * Deletes a user account. This endpoint is for testing purposes only.
 * Not exposed in the application UI.
 * 
 * Request body:
 * - userId?: string - The user ID to delete
 * - email?: string - The user email to delete (alternative to userId)
 * - username?: string - The username to delete (alternative to userId)
 * 
 * At least one identifier must be provided.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email, username } = req.body;

    // Validate that at least one identifier is provided
    if (!userId && !email && !username) {
      return res.status(400).json({ 
        error: 'At least one identifier required (userId, email, or username)' 
      });
    }

    // Find the user
    let query = supabaseAdmin.from('User').select('id, username, email, isGuest');

    if (userId) {
      query = query.eq('id', userId);
    } else if (email) {
      query = query.eq('email', email);
    } else if (username) {
      query = query.eq('username', username);
    }

    const { data: user, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete associated game sessions first (to maintain referential integrity)
    const { error: sessionsError } = await supabaseAdmin
      .from('GameSession')
      .delete()
      .eq('userId', user.id);

    if (sessionsError) {
      console.error('Error deleting game sessions:', sessionsError);
      throw sessionsError;
    }

    // Delete the user
    const { error: deleteError } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    return res.status(500).json({ error: errorMessage, details: error });
  }
}
