import { del, put } from "@vercel/blob";

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = await put(
        `listings/${crypto.randomUUID()}-${file.name}`,
        file,
        {
            access: "public",
        },
    );

    return Response.json({
        url: blob.url,
    });
}

export async function DELETE(request: Request) {
    const { url } = await request.json();

    if (!url) {
        return Response.json({ error: "Missing image URL" }, { status: 400 });
    }

    await del(url);

    return Response.json({ success: true });
}
