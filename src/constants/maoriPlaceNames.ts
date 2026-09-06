// Official NZGB (Ngā Pou Taunaha o Aotearoa / NZ Geographic Board) dual
// place names, verified individually against the LINZ Gazetteer's own
// public search API (gazetteer.linz.govt.nz/api/search?term=...) - only
// entries with status "Official" are included here.
//
// This is deliberately a short list. Of the ~77 volcanoes/towns this app
// shows, only these 3 turned out to have a real gazetted dual name; many
// well-known alternative names in everyday and tourism use - Tāmaki
// Makaurau (Auckland), Kirikiriroa (Hamilton), Ōtautahi (Christchurch),
// Tūhua (Mayor Island), Aotea (Great Barrier Island), and others - checked
// out as "Unofficial" in the Gazetteer and are intentionally left out
// rather than guessed in. Taranaki Maunga isn't here either: as of the
// Taranaki Maunga Collective Redress Act (30 Jan 2025), it's solely and
// officially "Taranaki Maunga" with its former English pairing retired,
// not a dual name - GeoNet already returns that name as-is.
export const OFFICIAL_DUAL_NAMES: Record<string, string> = {
  'White Island': 'Whakaari',
  'Milford Sound': 'Piopiotahi',
  'Franz Josef': 'Waiau',
}

/** "English" -> "Māori (English)" for places with an official dual name; unchanged otherwise. */
export function withMaoriName(englishName: string): string {
  const maoriName = OFFICIAL_DUAL_NAMES[englishName]
  return maoriName ? `${maoriName} (${englishName})` : englishName
}
