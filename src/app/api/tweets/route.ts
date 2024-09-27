import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tweets = await prisma.tweet.findMany({
    include: { likes: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tweets);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { content, username } = body;

  const tweet = await prisma.tweet.create({
    data: {
      content,
      username,
    },
    include: { likes: true },
  });

  return NextResponse.json(tweet);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, username } = body;

  const existingLike = await prisma.like.findUnique({
    where: {
      tweetId_username: {
        tweetId: id,
        username: username,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: {
        tweetId: id,
        username: username,
      },
    });
  }

  const updatedTweet = await prisma.tweet.findUnique({
    where: { id },
    include: { likes: true },
  });

  return NextResponse.json(updatedTweet);
}