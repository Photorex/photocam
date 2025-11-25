import { Session } from "next-auth";

export async function fetchUpdatedUserData({
    session,
    update,
  }: {
    session: any;
    update: (args: { user: any }) => Promise<Session | null>;
  }) {
    try {
      const response = await fetch(`/api/user/${session?.user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        await update({
          user: {
            ...session?.user,
            name: data.user.name,
            email: data.user.email,
            emailVerified: data.user.emailVerified,
            credits: data.user.credits,
            subscription: data.user.subscription,
            feedbackSubmitted: data.user.feedbackSubmitted,
            serviceModalShown: data.user.serviceModalShown,
            registrationGtmSent: data.user.registrationGtmSent,
            modelMap: data.user.modelMap,
          },
        });
      } else {
        console.error('Failed to fetch updated user data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching updated user data:', error);
    }
  }