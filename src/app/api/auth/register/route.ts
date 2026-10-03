export async function POST(req: Request) {
    const body = await req.json();

    const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/auth/register",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        },
    );

    const data = await res.json();
    const response = Response.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");

    if (setCookie) response.headers.set("set-cookie", setCookie);

    return response;
}
