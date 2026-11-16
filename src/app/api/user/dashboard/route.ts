import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await dbConnect();
  const userId = session.user.id;
  const user = await User.findById(userId).populate('favorites');

  const orders = await Order.find({ userId }).populate('items.productId');

  return NextResponse.json({
    user,
    orders
  });
}