
const token = "sbp_fe3fbdcc80e3d9c0e98b35be5f7c4096618f0c65";
const projectRef = "zpoqtqfscxpozkdvlqoi"; // Extracted from .env

async function resetRanking() {
    console.log(`Resetting ranking for project ${projectRef}...`);

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query: 'TRUNCATE TABLE christmas_players RESTART IDENTITY;' })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Error ${response.status}: ${text}`);
        } else {
            console.log("Success! Table truncated.");
            // Optional: Log result
            const result = await response.json();
            console.log(JSON.stringify(result, null, 2));
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

resetRanking();
