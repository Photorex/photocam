import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
  /* ------------------------------------------------------------------------ */
  /* 1. Parse token from path and optional “?return=” from the query-string    */
  /* ------------------------------------------------------------------------ */
  // URL looks like “…/activate/<uuid>[?return=%2Fonboarding%3Fstep%3D4]”
  const token = request.nextUrl.pathname.split('/').pop();      // uuid
  const returnRaw = request.nextUrl.searchParams.get('return'); // still encoded
  const returnTo  = returnRaw ? decodeURIComponent(returnRaw) : null;

  console.log('activation token:', token, 'returnTo:', returnTo);

  /* ------------------------------------------------------------------------ */
  /* 2. Verify account & handle referral bonus                               */
  /* ------------------------------------------------------------------------ */
  await connectMongoDB();

  const REF_CREDIT_BONUS = 50;
  const user = await User.findOneAndUpdate(
    { emailToken: token },
    { emailVerified: true, emailToken: null },
    { new: true }
  );

  if (user?.referredBy) {
    const now = new Date();
    await User.findByIdAndUpdate(
      user.referredBy,
      {
        $inc : { credits: REF_CREDIT_BONUS },
        $push: { referrals: user._id.toString(), referralsTime: now }
      },
      { new: true }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* 3. Decide where to send the browser next                                 */
  /* ------------------------------------------------------------------------ */
  let location = '/activation/error';

  if (user && returnTo) {
    // valid token + we were asked to bounce straight back
    location = returnTo.startsWith('/') ? returnTo : `/${returnTo}`;
  } else if (user) {
    location = '/activation/success';
  }

  // keep ?return= for the splash pages so the user can still click a button
  if ((location === '/activation/error' || location === '/activation/success') && returnRaw) {
    location += `?return=${returnRaw}`;
  }

  /* 4. send the 302 -------------------------------------------------------- */
  return new Response(null, {
    status : 302,
    headers: { Location: location }           // **relative – no host leakage**
  });
};