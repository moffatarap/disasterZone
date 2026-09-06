// Dual place names sourced from the LINZ Gazetteer's own public search API
// (gazetteer.linz.govt.nz/api/search?term=...), covering every place name
// this app shows: all 12 GeoNet volcanoes and all 65 towns in
// data/nzLocalities.ts. Every entry here is a real Gazetteer record - none
// are guessed in from general knowledge, Wikipedia prose, or council/
// tourism branding alone.
//
// Both "Official" and "Unofficial" Gazetteer status are included, per
// explicit request - better to show a real recorded name than not, even
// if the NZGB hasn't formally ratified it. This is still meaningfully
// different from "any Māori name in common use": plenty of well-known
// alternative names - Tāmaki Makaurau (Auckland), Kirikiriroa (Hamilton),
// Ōtautahi (Christchurch), Ōtepoti (Dunedin), Whakatū (Nelson), Ngāmotu
// (New Plymouth), and others - were checked directly against the
// Gazetteer and have NO record pairing them with the town/city at all
// (official or unofficial), so they're correctly left out rather than
// added on the strength of common usage alone.
//
// Taranaki Maunga isn't here: as of the Taranaki Maunga Collective Redress
// Act (30 Jan 2025), it's solely and officially "Taranaki Maunga" with its
// former English pairing retired, not a dual name - GeoNet already
// returns that name as-is.
export const DUAL_NAMES: Record<string, string> = {
  'White Island': 'Whakaari', // Gazetteer: "Whakaari / White Island", Official
  'Mayor Island': 'Tūhua', // Gazetteer: "Mayor Island / Tūhua", Unofficial
  'Milford Sound': 'Piopiotahi', // Gazetteer: "Milford Sound/Piopiotahi", Official
  'Franz Josef': 'Waiau', // Gazetteer: "Franz Josef/Waiau", Official
  'Great Barrier Island': 'Aotea', // Gazetteer: "Great Barrier Island (Aotea Island)", Unofficial
}

/** "English" -> "Māori (English)" for places with a recorded dual name; unchanged otherwise. */
export function withMaoriName(englishName: string): string {
  const maoriName = DUAL_NAMES[englishName]
  return maoriName ? `${maoriName} (${englishName})` : englishName
}
