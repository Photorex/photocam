import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';

export async function PUT(req: NextRequest) {
    try {
      await connectMongoDB();

      const body = await req.json();
      const { email, tokensToAdd } = body;

      console.log("email, tokensToAdd", email, tokensToAdd)

      console.log("body", email, tokensToAdd);
      const user = await User.findOne({ email });

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      const updatedUser = await User.findOneAndUpdate({ email }, { $inc: { credits: tokensToAdd } }, { new: true });

      if (!updatedUser) {
        return NextResponse.json({ message: 'Error updating user credits' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'User credits updated successfully', 
        user: updatedUser, 
        newTokenCount: updatedUser.credits // Include this line to send the new token count
      }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error updating user credits:', error);
        
        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }
        
        return NextResponse.json({ message: 'Error updating user credits', error: errorMessage }, { status: 500 });
    }
}