// bolt/backend/nasaPlanets.ts

export const config = {
  runtime: "edge",
};

const NASA_BASE_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

export default async function handler(req: Request) {
  const query = `
    SELECT pl_name, pl_rade, pl_bmasse, pl_orbper, pl_eqt, st_teff, st_age, 
           st_mass, st_dens, disc_year, discoverymethod, 
           disc_locale, disc_facility, st_rad, pl_orbsmax, pl_orbeccen, 
           pl_insol, sy_dist
    FROM pscomppars 
    WHERE pl_name IS NOT NULL
    ORDER BY disc_year DESC
    LIMIT 200
  `;

  const formData = new URLSearchParams();
  formData.append("query", query);
  formData.append("format", "csv");

  try {
    const response = await fetch(NASA_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ShaanSoniApp/1.0 (StudentProject)"
      },
      body: formData,
    });

    if (!response.ok) {
      return new Response("NASA API error", { status: 500 });
    }

    const text = await response.text();

    return new Response(JSON.stringify({ rawCSV: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response("Fetch failed", { status: 500 });
  }
}
