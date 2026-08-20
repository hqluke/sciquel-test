import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { commentGetSchema, commentPostSchema } from "./schema";

// Get the 50 most recent comments from the database, starting at the given index
export async function GET(req: NextRequest) {
    const parsedQuery = commentGetSchema.safeParse(
        Object.fromEntries(req.nextUrl.searchParams),
    );
    if (!parsedQuery.success)
        return NextResponse.json(
            {
                error: "Invalid query parameters",
                fieldErrors: parsedQuery.error.flatten().fieldErrors,
            },
            { status: 400 },
        );

    try {
        const comments = await prisma.comment.findMany({
            skip: parsedQuery.data.index,
            take: 50,
            orderBy: {
                createdAt: "desc",
            },
        });

        if (comments.length === 0)
            return NextResponse.json(
                { error: "No comments found" },
                { status: 404 },
            );
        return NextResponse.json(comments, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {
                error: "Internal server error, could not fetch comments.",
                code: 500,
            },
            { status: 500 },
        );
    }
}

// Create a comment
export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const parsedBody = commentPostSchema.safeParse(body);
    if (!parsedBody.success)
        return NextResponse.json(
            {
                error: "Invalid request body",
                fieldErrors: parsedBody.error.flatten().fieldErrors,
            },
            { status: 400 },
        );

    try {
        await prisma.comment.create({
            data: {
                name: parsedBody.data.name,
                text: parsedBody.data.comment,
                email: parsedBody.data.email,
            },
        });

        return NextResponse.json({
            ok: `Comment created successfully.`,
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            {
                error: "Internal server error, could not create comment.",
                code: 500,
            },
            { status: 500 },
        );
    }
}
