export interface BibleBook {
  id: string;
  name: string;
  testament: "OT" | "NT";
  totalChapters: number;
  section?: string;
  purpose?: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  {
    "id": "GEN",
    "name": "Genesis",
    "testament": "OT",
    "totalChapters": 50,
    "section": "Pentateuch",
    "purpose": "Chronicles creation, the fall of humanity, and the origin of God's covenant with Abraham and his descendants."
  },
  {
    "id": "EXO",
    "name": "Exodus",
    "testament": "OT",
    "totalChapters": 40,
    "section": "Pentateuch",
    "purpose": "Records Israel's miraculous deliverance from Egyptian slavery, the giving of the Law at Mount Sinai, and the establishment of the Tabernacle."
  },
  {
    "id": "LEV",
    "name": "Leviticus",
    "testament": "OT",
    "totalChapters": 27,
    "section": "Pentateuch",
    "purpose": "Outlines the holiness code, sacrificial offerings, and priestly duties required to dwell in communion with a holy God."
  },
  {
    "id": "NUM",
    "name": "Numbers",
    "testament": "OT",
    "totalChapters": 36,
    "section": "Pentateuch",
    "purpose": "Details the census and 40-year wilderness wanderings of Israel due to unbelief, showcasing God's persistent covenant faithfulness."
  },
  {
    "id": "DEU",
    "name": "Deuteronomy",
    "testament": "OT",
    "totalChapters": 34,
    "section": "Pentateuch",
    "purpose": "Moses' farewell discourses to the new generation on the plains of Moab, reiterating the Law and the choice between life and death."
  },
  {
    "id": "JOS",
    "name": "Joshua",
    "testament": "OT",
    "totalChapters": 24,
    "section": "Historical",
    "purpose": "Narrates the military conquest, division, and settlement of the Promised Land under Joshua's godly leadership."
  },
  {
    "id": "JDG",
    "name": "Judges",
    "testament": "OT",
    "totalChapters": 21,
    "section": "Historical",
    "purpose": "Depicts the cyclical spiral of Israel's apostasy, oppression, repentance, and deliverance through charismatic regional judges."
  },
  {
    "id": "RUT",
    "name": "Ruth",
    "testament": "OT",
    "totalChapters": 4,
    "section": "Historical",
    "purpose": "A story of redemptive love and covenant loyalty (hesed) foreshadowing the kinsman-redeemer and the lineage of King David and Christ."
  },
  {
    "id": "1SA",
    "name": "1 Samuel",
    "testament": "OT",
    "totalChapters": 31,
    "section": "Historical",
    "purpose": "Chronicles the transition from the era of the judges to the monarchy, highlighting Samuel, King Saul's tragic reign, and the rise of David."
  },
  {
    "id": "2SA",
    "name": "2 Samuel",
    "testament": "OT",
    "totalChapters": 24,
    "section": "Historical",
    "purpose": "Records the sovereign triumphs, tragic sins, and domestic turmoil of King David's 40-year reign over united Israel."
  },
  {
    "id": "1KI",
    "name": "1 Kings",
    "testament": "OT",
    "totalChapters": 22,
    "section": "Historical",
    "purpose": "Details the golden age under King Solomon, the construction of the Temple, and the tragic fracturing of the kingdom into Israel and Judah."
  },
  {
    "id": "2KI",
    "name": "2 Kings",
    "testament": "OT",
    "totalChapters": 25,
    "section": "Historical",
    "purpose": "Recounts the parallel histories and eventual military exiles of the divided kingdoms (Israel to Assyria, Judah to Babylon)."
  },
  {
    "id": "1CH",
    "name": "1 Chronicles",
    "testament": "OT",
    "totalChapters": 29,
    "section": "Historical",
    "purpose": "Priestly retelling of Israel's history emphasizing David's royal lineage, temple worship preparations, and covenant worship."
  },
  {
    "id": "2CH",
    "name": "2 Chronicles",
    "testament": "OT",
    "totalChapters": 36,
    "section": "Historical",
    "purpose": "Chronicles the reigns of the Davidic kings of Judah, focusing on moments of revival, obedience, and the Babylonian captivity."
  },
  {
    "id": "EZR",
    "name": "Ezra",
    "testament": "OT",
    "totalChapters": 10,
    "section": "Historical",
    "purpose": "Documents the post-exilic return of the Jewish remnant from Babylon, the rebuilding of the second Temple, and the restoration of the Law."
  },
  {
    "id": "NEH",
    "name": "Nehemiah",
    "testament": "OT",
    "totalChapters": 13,
    "section": "Historical",
    "purpose": "Records the post-exilic rebuilding of Jerusalem's ruined walls in 52 days and the moral reform of the restored community."
  },
  {
    "id": "EST",
    "name": "Esther",
    "testament": "OT",
    "totalChapters": 10,
    "section": "Historical",
    "purpose": "Illustrates God's silent, providential protection of the Jewish diaspora in Persia from genocide through Queen Esther and Mordecai."
  },
  {
    "id": "JOB",
    "name": "Job",
    "testament": "OT",
    "totalChapters": 42,
    "section": "Poetry & Wisdom",
    "purpose": "Examines the mystery of innocent human suffering, cosmic warfare, and divine sovereignty through philosophical dialogues."
  },
  {
    "id": "PSA",
    "name": "Psalms",
    "testament": "OT",
    "totalChapters": 150,
    "section": "Poetry & Wisdom",
    "purpose": "The inspired prayer book and hymnal of ancient Israel, expressing the full spectrum of praise, lament, and messianic hope."
  },
  {
    "id": "PRO",
    "name": "Proverbs",
    "testament": "OT",
    "totalChapters": 31,
    "section": "Poetry & Wisdom",
    "purpose": "A collection of divinely inspired aphorisms and practical wisdom for cultivating the fear of the Lord, righteousness, and prudence."
  },
  {
    "id": "ECC",
    "name": "Ecclesiastes",
    "testament": "OT",
    "totalChapters": 12,
    "section": "Poetry & Wisdom",
    "purpose": "A philosophical exploration of the futility of life \"under the sun\" apart from the fear of God and keeping His commandments."
  },
  {
    "id": "SNG",
    "name": "Song of Solomon",
    "testament": "OT",
    "totalChapters": 8,
    "section": "Poetry & Wisdom",
    "purpose": "An allegorical and lyrical celebration of romantic love, marital fidelity, and intimacy reflecting Christ's love for His bride."
  },
  {
    "id": "ISA",
    "name": "Isaiah",
    "testament": "OT",
    "totalChapters": 66,
    "section": "Major Prophets",
    "purpose": "The \"Fifth Gospel\" prophesying judgment, restoration, the virgin-born Immanuel, and the redemptive suffering of the Lord's Servant."
  },
  {
    "id": "JER",
    "name": "Jeremiah",
    "testament": "OT",
    "totalChapters": 52,
    "section": "Major Prophets",
    "purpose": "The weeping prophet's impassioned warnings to Judah regarding the Babylonian exile and the promise of a future New Covenant."
  },
  {
    "id": "LAM",
    "name": "Lamentations",
    "testament": "OT",
    "totalChapters": 5,
    "section": "Major Prophets",
    "purpose": "Five acrostic funeral dirges grieving the destruction of Jerusalem and the Temple, anchored in God's unfailing morning mercies."
  },
  {
    "id": "EZK",
    "name": "Ezekiel",
    "testament": "OT",
    "totalChapters": 48,
    "section": "Major Prophets",
    "purpose": "Apocalyptic visions, street theater prophecies, and promises of spiritual regeneration given to Jewish exiles by the river Chebar."
  },
  {
    "id": "DAN",
    "name": "Daniel",
    "testament": "OT",
    "totalChapters": 12,
    "section": "Major Prophets",
    "purpose": "Chronicles the sovereign rule of God over Gentile world empires, faithfulness in exile, and eschatological visions of the Son of Man."
  },
  {
    "id": "HOS",
    "name": "Hosea",
    "testament": "OT",
    "totalChapters": 14,
    "section": "Minor Prophets",
    "purpose": "A living prophetic drama of marriage to an unfaithful wife illustrating God's unyielding, jealous love for apostate Israel."
  },
  {
    "id": "JOL",
    "name": "Joel",
    "testament": "OT",
    "totalChapters": 3,
    "section": "Minor Prophets",
    "purpose": "Prophesies the devastating \"Day of the Lord\" through a locust plague, calling for national repentance and promising the outpouring of the Holy Spirit."
  },
  {
    "id": "AMO",
    "name": "Amos",
    "testament": "OT",
    "totalChapters": 9,
    "section": "Minor Prophets",
    "purpose": "A shepherd's uncompromising declaration of divine justice against social oppression and religious hypocrisy in the Northern Kingdom."
  },
  {
    "id": "OBA",
    "name": "Obadiah",
    "testament": "OT",
    "totalChapters": 1,
    "section": "Minor Prophets",
    "purpose": "A brief prophecy pronouncing divine judgment against Edom for arrogance and gloating over Jerusalem's fall."
  },
  {
    "id": "JON",
    "name": "Jonah",
    "testament": "OT",
    "totalChapters": 4,
    "section": "Minor Prophets",
    "purpose": "A reluctant prophet's mission to Nineveh revealing God's sovereign mercy toward Gentile nations and exposing human self-righteousness."
  },
  {
    "id": "MIC",
    "name": "Micah",
    "testament": "OT",
    "totalChapters": 7,
    "section": "Minor Prophets",
    "purpose": "Preaches against civic injustice and corrupt leadership while announcing the exact birthplace of the coming Messiah in Bethlehem."
  },
  {
    "id": "NAM",
    "name": "Nahum",
    "testament": "OT",
    "totalChapters": 3,
    "section": "Minor Prophets",
    "purpose": "Pronounces the irreversible judgment and complete downfall of Nineveh, the brutal capital of the Assyrian Empire."
  },
  {
    "id": "HAB",
    "name": "Habakkuk",
    "testament": "OT",
    "totalChapters": 3,
    "section": "Minor Prophets",
    "purpose": "A prophet's honest wrestle with God over the use of wicked Babylon as an instrument of discipline, concluding in triumphant faith."
  },
  {
    "id": "ZEP",
    "name": "Zephaniah",
    "testament": "OT",
    "totalChapters": 3,
    "section": "Minor Prophets",
    "purpose": "Proclaims the purifying fire of the Day of the Lord against all nations while promising joy and restoration for a humble remnant."
  },
  {
    "id": "HAG",
    "name": "Haggai",
    "testament": "OT",
    "totalChapters": 2,
    "section": "Minor Prophets",
    "purpose": "Exhorts the returned post-exilic remnant to stop neglecting the Lord's house and rebuild the second Temple."
  },
  {
    "id": "ZEC",
    "name": "Zechariah",
    "testament": "OT",
    "totalChapters": 14,
    "section": "Minor Prophets",
    "purpose": "Apocalyptic visions of the coming Priest-King, the pierced Messiah, and the global triumph of Jerusalem to encourage the temple builders."
  },
  {
    "id": "MAL",
    "name": "Malachi",
    "testament": "OT",
    "totalChapters": 4,
    "section": "Minor Prophets",
    "purpose": "Rebukes post-exilic religious complacency, corrupt priesthood, and marital divorce while promising the forerunner Elijah."
  },
  {
    "id": "MAT",
    "name": "Matthew",
    "testament": "NT",
    "totalChapters": 28,
    "section": "Gospels & Acts",
    "purpose": "Presents Jesus Christ as the promised Jewish Messiah, King of Israel, and fulfillment of Old Testament covenant prophecies."
  },
  {
    "id": "MRK",
    "name": "Mark",
    "testament": "NT",
    "totalChapters": 16,
    "section": "Gospels & Acts",
    "purpose": "Fast-paced Gospel presenting Jesus as the suffering Servant-King who acts with immediate divine authority and gives His life as a ransom."
  },
  {
    "id": "LUK",
    "name": "Luke",
    "testament": "NT",
    "totalChapters": 24,
    "section": "Gospels & Acts",
    "purpose": "Comprehensive, historical account presenting Jesus as the compassionate Son of Man who came to seek and save the lost and marginalized."
  },
  {
    "id": "JHN",
    "name": "John",
    "testament": "NT",
    "totalChapters": 21,
    "section": "Gospels & Acts",
    "purpose": "The theological Gospel portraying Jesus as the eternal Word made flesh, the \"I AM,\" and the only source of eternal life."
  },
  {
    "id": "ACT",
    "name": "Acts",
    "testament": "NT",
    "totalChapters": 28,
    "section": "Gospels & Acts",
    "purpose": "The thrilling history of the birth and rapid expansion of the early Church through the power of the Holy Spirit from Jerusalem to Rome."
  },
  {
    "id": "ROM",
    "name": "Romans",
    "testament": "NT",
    "totalChapters": 16,
    "section": "Epistles",
    "purpose": "Paul's masterwork on the theology of salvation, justification by faith alone, the righteousness of God, and Christian living."
  },
  {
    "id": "1CO",
    "name": "1 Corinthians",
    "testament": "NT",
    "totalChapters": 16,
    "section": "Epistles",
    "purpose": "Pastoral correction addressing church division, sexual immorality, spiritual gifts, order in worship, and the resurrection."
  },
  {
    "id": "2CO",
    "name": "2 Corinthians",
    "testament": "NT",
    "totalChapters": 13,
    "section": "Epistles",
    "purpose": "Paul's passionate defense of his scriptural authority, the ministry of reconciliation, and strength perfected in human weakness."
  },
  {
    "id": "GAL",
    "name": "Galatians",
    "testament": "NT",
    "totalChapters": 6,
    "section": "Epistles",
    "purpose": "A fierce defense of the Gospel of pure grace against legalism, declaring that believers are justified by faith, not works of the Law."
  },
  {
    "id": "EPH",
    "name": "Ephesians",
    "testament": "NT",
    "totalChapters": 6,
    "section": "Epistles",
    "purpose": "Unveils the cosmic mystery of the Church as the Body of Christ, spiritual blessings in heavenly places, and the whole armor of God."
  },
  {
    "id": "PHP",
    "name": "Philippians",
    "testament": "NT",
    "totalChapters": 4,
    "section": "Epistles",
    "purpose": "A joyous prison epistle encouraging unity, humility modeled after Christ, and rejoicing in the Lord regardless of circumstances."
  },
  {
    "id": "COL",
    "name": "Colossians",
    "testament": "NT",
    "totalChapters": 4,
    "section": "Epistles",
    "purpose": "Proclaims the supreme preeminence of Jesus Christ over all creation, the church, and unseen spiritual powers against early gnostic heresy."
  },
  {
    "id": "1TH",
    "name": "1 Thessalonians",
    "testament": "NT",
    "totalChapters": 5,
    "section": "Epistles",
    "purpose": "Warm pastoral encouragement on holy living, brotherly love, and the imminent, glorious return of Jesus Christ for His saints."
  },
  {
    "id": "2TH",
    "name": "2 Thessalonians",
    "testament": "NT",
    "totalChapters": 3,
    "section": "Epistles",
    "purpose": "Clarifies end-times deception, the revelation of the man of lawlessness, and the call to steadfast labor before the Day of the Lord."
  },
  {
    "id": "1TI",
    "name": "1 Timothy",
    "testament": "NT",
    "totalChapters": 6,
    "section": "Epistles",
    "purpose": "Practical instructions to young pastor Timothy on sound doctrine, church leadership qualifications, order, and pastoral care."
  },
  {
    "id": "2TI",
    "name": "2 Timothy",
    "testament": "NT",
    "totalChapters": 4,
    "section": "Epistles",
    "purpose": "Paul's moving final letter from Roman death row urging Timothy to guard the deposit of faith, preach the Word, and finish the race."
  },
  {
    "id": "TIT",
    "name": "Titus",
    "testament": "NT",
    "totalChapters": 3,
    "section": "Epistles",
    "purpose": "Guidelines for organizing the churches in Crete, appointing sound elders, and preaching doctrine that produces good works."
  },
  {
    "id": "PHM",
    "name": "Philemon",
    "testament": "NT",
    "totalChapters": 1,
    "section": "Epistles",
    "purpose": "A masterclass in Christian grace and reconciliation, pleading for the runaway slave Onesimus to be received as a beloved brother."
  },
  {
    "id": "HEB",
    "name": "Hebrews",
    "testament": "NT",
    "totalChapters": 13,
    "section": "Epistles",
    "purpose": "Majestic treatise demonstrating the absolute superiority of Jesus Christ and the New Covenant over the Levitical sacrificial system."
  },
  {
    "id": "JAS",
    "name": "James",
    "testament": "NT",
    "totalChapters": 5,
    "section": "Epistles",
    "purpose": "Practical, uncompromising manual on living faith, demonstrating that true saving faith produces tangible good works, endurance, and tongue control."
  },
  {
    "id": "1PE",
    "name": "1 Peter",
    "testament": "NT",
    "totalChapters": 5,
    "section": "Epistles",
    "purpose": "Comfort and pastoral counsel for believers facing fiery persecution, anchoring their hope in their heavenly inheritance."
  },
  {
    "id": "2PE",
    "name": "2 Peter",
    "testament": "NT",
    "totalChapters": 3,
    "section": "Epistles",
    "purpose": "Final scriptural warning against false teachers, scoffers, and apostasy, exhorting believers to grow in the grace and knowledge of Christ."
  },
  {
    "id": "1JN",
    "name": "1 John",
    "testament": "NT",
    "totalChapters": 5,
    "section": "Epistles",
    "purpose": "Pastoral letter emphasizing fellowship with God, walking in the light, authentic brotherly love, and certainty of eternal salvation."
  },
  {
    "id": "2JN",
    "name": "2 John",
    "testament": "NT",
    "totalChapters": 1,
    "section": "Epistles",
    "purpose": "Urgent warning to a local congregation to walk in love while guarding against deceivers who deny the incarnation of Christ."
  },
  {
    "id": "3JN",
    "name": "3 John",
    "testament": "NT",
    "totalChapters": 1,
    "section": "Epistles",
    "purpose": "Commends Gaius for hospitality to traveling missionaries and warns against the authoritarian, prideful leadership of Diotrephes."
  },
  {
    "id": "JUD",
    "name": "Jude",
    "testament": "NT",
    "totalChapters": 1,
    "section": "Epistles",
    "purpose": "Fiery exhortation to earnestly contend for the faith once delivered to the saints against antinomian heretics who turn grace into license."
  },
  {
    "id": "REV",
    "name": "Revelation",
    "testament": "NT",
    "totalChapters": 22,
    "section": "Prophecy",
    "purpose": "The climactic apocalyptic disclosure of Jesus Christ triumphant, the defeat of Satan and Babylon, the final judgment, and the New Jerusalem."
  }
];
