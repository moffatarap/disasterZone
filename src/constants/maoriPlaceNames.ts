// Dual place names for every place this app shows (all 12 GeoNet volcanoes,
// all 65 towns in data/nzLocalities.ts), from two tiers of source, each
// verified individually rather than guessed in from general knowledge:
//
// 1. LINZ Gazetteer records (gazetteer.linz.govt.nz) - both "Official" and
//    "Unofficial" status count, per explicit request (better to show a
//    real recorded name than not, even unratified). Checked against the
//    Gazetteer's full bulk export (gazetteer.linz.govt.nz/gaz.csv,
//    ~54,700 records), not just individual searches, to rule out missing
//    anything: White Island, Mayor Island, Milford Sound, Franz Josef,
//    Great Barrier Island.
//
// 2. Traditional/historical Māori names with no Gazetteer record at all,
//    verified against Te Ara (Encyclopedia of NZ) and/or Wikipedia to
//    confirm correct spelling (macrons matter - a missing macron is a
//    different word) and genuine historical attestation. This includes
//    names for a river, harbour, or land block the town is built on or
//    named after (Wellington/Te Whanganui-a-Tara, the harbour; Gisborne/
//    Tūranganui-a-Kiwa, officially gazetted for Poverty Bay specifically;
//    Lower Hutt/Awakairangi and Ashburton/Hakatere, their rivers;
//    Hastings/Heretaunga, the land block Hastings was built on) - initially
//    left out on a "must name the town, not an adjacent feature" test, but
//    that's a Western administrative distinction that doesn't fit how
//    Māori place-naming actually works, where a settlement's identity and
//    its river/harbour are often the same naming tradition rather than
//    separate namespaces. Kept out instead: names that turned out
//    unattested or likely transcription errors when checked (Alexandra
//    "Areketanara" is a modern phonetic transliteration with no historical
//    use; Dannevirke "Taniwaka" isn't documented anywhere and closely
//    resembles "taniwha," probably a mix-up; Masterton "Te Oreore" is
//    actually Te Ore Ore, a marae near Masterton, not the town's own name;
//    Upper Hutt "Whakatiki" is unattested and likely a garbling of the
//    nearby Whakatīkei River) - those are excluded for not being real
//    attested names at all, not for naming the "wrong" kind of feature.
export const DUAL_NAMES: Record<string, string> = {
  // Tier 1: LINZ Gazetteer record (Official or Unofficial status)
  'White Island': 'Whakaari', // Gazetteer: "Whakaari / White Island", Official
  'Mayor Island': 'Tūhua', // Gazetteer: "Mayor Island / Tūhua", Unofficial
  'Milford Sound': 'Piopiotahi', // Gazetteer: "Milford Sound/Piopiotahi", Official
  'Franz Josef': 'Waiau', // Gazetteer: "Franz Josef/Waiau", Official
  'Great Barrier Island': 'Aotea', // Gazetteer: "Great Barrier Island (Aotea Island)", Unofficial

  // Tier 2: traditional/historical name, no Gazetteer record, verified
  // via Te Ara/Wikipedia
  Napier: 'Ahuriri',
  Feilding: 'Aorangi',
  Thames: 'Parawai',
  Levin: 'Taitoko',
  Cambridge: 'Kemureti',
  Hamilton: 'Kirikiriroa',
  Greymouth: 'Māwhera',
  'New Plymouth': 'Ngāmotu',
  Christchurch: 'Ōtautahi',
  Dunedin: 'Ōtepoti',
  'Palmerston North': 'Te Papaioea',
  Blenheim: 'Waiharakeke',
  Invercargill: 'Waihōpai',
  Nelson: 'Whakatū',
  Wellington: 'Te Whanganui-a-Tara', // names Wellington Harbour
  Gisborne: 'Tūranganui-a-Kiwa', // Gazetteer: "Tūranganui-a-Kiwa / Poverty Bay", Official (names the bay)
  'Lower Hutt': 'Awakairangi', // names the Hutt River / Te Awa Kairangi
  Ashburton: 'Hakatere', // Gazetteer: "Ashburton River/Hakatere", Official (names the river)
  Hastings: 'Heretaunga', // names the land block Hastings was built on
}

/** "English" -> "Māori (English)" for places with a recorded dual name; unchanged otherwise. */
export function withMaoriName(englishName: string): string {
  const maoriName = DUAL_NAMES[englishName]
  return maoriName ? `${maoriName} (${englishName})` : englishName
}
