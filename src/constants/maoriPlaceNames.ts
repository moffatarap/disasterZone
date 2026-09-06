// Dual place names for every place this app shows (all 12 GeoNet volcanoes,
// all 65 towns in data/nzLocalities.ts), from three tiers of source, each
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
//    names for a river, harbour, land block, or the wider district/takiwā
//    a town is built on, named after, or centred in (Wellington/Te
//    Whanganui-a-Tara, the harbour; Gisborne/Tūranganui-a-Kiwa, officially
//    gazetted for Poverty Bay specifically; Ashburton/Hakatere, its river;
//    Hastings/Heretaunga, the land block Hastings was built on; Alexandra/
//    Manuherikia, the town's own name before its 1863 renaming; Dannevirke/
//    Tāmaki-nui-ā-Rua, the takiwā its local iwi authority is named after;
//    Masterton/Whakaoriori, the original name for the area, still used in
//    the town's own civic branding) - initially left off on a "must name
//    the town, not an adjacent feature" test, but that's a Western
//    administrative distinction that doesn't fit how Māori place-naming
//    actually works, where a settlement's identity and its river, harbour,
//    or district are often the same naming tradition rather than separate
//    namespaces. Kept out regardless: names that turned out unattested or
//    likely transcription errors when checked (Alexandra's first candidate
//    "Areketanara" was a modern phonetic transliteration with no historical
//    use; Dannevirke's first candidate "Taniwaka" isn't documented anywhere
//    and closely resembles "taniwha," probably a mix-up; Masterton's first
//    candidate "Te Oreore" is actually Te Ore Ore, a marae near Masterton,
//    not the town's own name; Upper Hutt's first candidate "Whakatiki" is
//    unattested and likely a garbling of the nearby Whakatīkei River) -
//    those are excluded for not being real attested names at all, not for
//    naming the "wrong" kind of feature.
//
// 3. Modern council/government-coined pairings for places with no
//    historical toponym of their own: Upper Hutt and Lower Hutt are both
//    1900s subdivisions of the same original Hutt Valley settlement, so
//    neither has its own pre-European name - "Te Awa Kairangi ki Uta"
//    (inland) and "Te Awa Kairangi ki Tai" (seaward) are RiverLink's
//    (Hutt City/Upper Hutt City/GWRC/Waka Kotahi's joint programme) official
//    paired Māori names for the two cities, both derived from the Hutt
//    River's own name.
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
  Ashburton: 'Hakatere', // Gazetteer: "Ashburton River/Hakatere", Official (names the river)
  Hastings: 'Heretaunga', // names the land block Hastings was built on
  Alexandra: 'Manuherikia', // the town's own name before its 1863 renaming
  Dannevirke: 'Tāmaki-nui-ā-Rua', // the takiwā its local iwi authority (Rangitāne o Tāmaki-nui-ā-Rua) is named after
  Masterton: 'Whakaoriori', // original name for the area; still used in the town's own civic branding

  // Tier 3: modern council/government-coined pairing (RiverLink), no
  // historical toponym of their own since both are 1900s subdivisions of
  // one original settlement
  'Upper Hutt': 'Te Awa Kairangi ki Uta',
  'Lower Hutt': 'Te Awa Kairangi ki Tai',
}

/** "English" -> "Māori (English)" for places with a recorded dual name; unchanged otherwise. */
export function withMaoriName(englishName: string): string {
  const maoriName = DUAL_NAMES[englishName]
  return maoriName ? `${maoriName} (${englishName})` : englishName
}
