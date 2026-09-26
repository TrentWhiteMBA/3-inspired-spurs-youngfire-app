import { Lesson } from '../types/lesson';

export interface LessonAttachment {
  name: string;
  url: string;
  size: string;
  type: string;
}

export interface DiscipleshipLesson extends Lesson {
  seriesTitle?: string;
  lessonTitle: string; // alias for title
  dateOrSeason?: string;
  teachers?: string; // alias for facilitator
  theme?: string;
  summary?: string; // alias for description
  primaryPassage?: string; // alias for scripturePassage
  bookId?: string;
  chapter?: number;
  notesContent?: string; // alias for studyNotes
  questions?: string[];
  challenge?: string;
  attachments?: LessonAttachment[];
  youtubeId?: string;
  videoUrl?: string;
  canEdit?: boolean;
}

export const INITIAL_AUTHENTIC_LESSONS: DiscipleshipLesson[] = [
  {
    id: 'lesson_church_sardis_laodicea',
    title: 'What Church Do You Belong To? (Sardis, Philadelphia, Laodicea)',
    lessonTitle: 'What Church Do You Belong To? (Sardis, Philadelphia, Laodicea)',
    seriesTitle: 'Seven Churches of Revelation Series',
    teachingDate: '2026-09-02',
    dateOrSeason: 'Wednesday Study & Small Group Discipleship',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'A direct biblical audit examining the letters of Jesus to Sardis (the dead church living on former glory), Philadelphia (the faithful church holding fast with little strength), and Laodicea (the lukewarm church blinded by self-sufficiency).',
    summary: 'A direct biblical audit examining the letters of Jesus to Sardis (the dead church living on former glory), Philadelphia (the faithful church holding fast with little strength), and Laodicea (the lukewarm church blinded by self-sufficiency).',
    scripturePassage: 'Revelation 3:1–22',
    primaryPassage: 'Revelation 3:1–22',
    bookId: 'REV',
    chapter: 3,
    theme: 'Overcoming Spiritual Apathy, Half-Hearted Indifference & Comfort',
    youtubeId: 'rCSwaCZsAHg',
    youtubeUrl: 'https://www.youtube.com/watch?v=rCSwaCZsAHg',
    videoUrl: 'https://www.youtube.com/watch?v=rCSwaCZsAHg',
    studyNotes: `Revelation 3:1-6 — The Church of Sardis ("The Dead Church"):
Jesus addresses Sardis: "I know thy works, that thou hast a name that thou livest, and art dead." They had a sparkling reputation and looked like perfect churchgoers, but were spiritually comatose. No persecution or doctrinal conflict is cited—they simply existed in apathetic comfort.

Spiritual Apathy leads to Spiritual Death:
Apathy is the direct opposite of love. When life is comfortable, we are most vulnerable to believing we do not need God. Matthew 5:27-30 shows the radical seriousness required to fight sin.

Revelation 3:7-13 — The Church of Philadelphia:
Even with "little power", Philadelphia kept God's word and did not deny His name. Size, wealth, and influence do not determine who God uses. Truth is not determined by popularity. Trust and faithfulness determine impact (2 Corinthians 4:14-18).

Revelation 3:14-22 — The Church of Laodicea:
Laodicea resembled its lukewarm water supply—neither healing-hot nor refreshing-cold. They claimed, "I am rich and need nothing," but were spiritually blind and naked. Matthew 7:13-14 shows the broad road of compromise vs. the narrow road of life. Jesus knocks at the door with an invitation of grace.

Key Reflection & Intercession:
- Share prayer call number with Youngfire group.
- Keep lifting up Nancy Martinez and Aaron, our grandparents, and Whitney's student Grayson whose father passed away.`,
    notesContent: `Revelation 3:1-6 — The Church of Sardis ("The Dead Church"):
Jesus addresses Sardis: "I know thy works, that thou hast a name that thou livest, and art dead." They had a sparkling reputation and looked like perfect churchgoers, but were spiritually comatose. No persecution or doctrinal conflict is cited—they simply existed in apathetic comfort.

Spiritual Apathy leads to Spiritual Death:
Apathy is the direct opposite of love. When life is comfortable, we are most vulnerable to believing we do not need God. Matthew 5:27-30 shows the radical seriousness required to fight sin.

Revelation 3:7-13 — The Church of Philadelphia:
Even with "little power", Philadelphia kept God's word and did not deny His name. Size, wealth, and influence do not determine who God uses. Truth is not determined by popularity. Trust and faithfulness determine impact (2 Corinthians 4:14-18).

Revelation 3:14-22 — The Church of Laodicea:
Laodicea resembled its lukewarm water supply—neither healing-hot nor refreshing-cold. They claimed, "I am rich and need nothing," but were spiritually blind and naked. Matthew 7:13-14 shows the broad road of compromise vs. the narrow road of life. Jesus knocks at the door with an invitation of grace.

Key Reflection & Intercession:
- Share prayer call number with Youngfire group.
- Keep lifting up Nancy Martinez and Aaron, our grandparents, and Whitney's student Grayson whose father passed away.`,
    questions: [
      'Where do I actively serve in the kingdom?',
      'What does my personal relationship with God look like when nobody is watching?',
      'What does my relationship with people look like—am I sharing Christ?',
      'What is an area of your faith that you have become comfortable in?',
      'Pick someone in your life going through something difficult: how can you practically love them today?'
    ],
    challenge: 'Choose 1 practical thing today to stir up your affections for Christ: fast a meal, spend 30 dedicated minutes in prayer, or financially bless someone in need. Move from lukewarmness into holy fire!',
    attachmentUrls: [],
    attachments: [
      { name: 'What_Church_Do_You_Belong_To_Notes.pdf', url: '#', size: '284 KB', type: 'application/pdf' },
      { name: 'Sardis_Philadelphia_Study_Guide.pdf', url: '#', size: '192 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_blessing_of_community',
    title: 'The Blessing of a Community: Personal But Never Private',
    lessonTitle: 'The Blessing of a Community: Personal But Never Private',
    seriesTitle: 'Koinonia: Discipleship in Covenant',
    teachingDate: '2026-09-09',
    dateOrSeason: 'Tuesday Fellowship Huddle',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'Following Jesus may be deeply personal, but it was never intended to be private. God created humanity for communion, and Jesus commissioned the Eleven together on the mountain.',
    summary: 'Following Jesus may be deeply personal, but it was never intended to be private. God created humanity for communion, and Jesus commissioned the Eleven together on the mountain.',
    scripturePassage: 'Matthew 28:16–20 & Matthew 18:15–20',
    primaryPassage: 'Matthew 28:16–20 & Matthew 18:15–20',
    bookId: 'MAT',
    chapter: 28,
    theme: 'Biblical Fellowship, Accountability & The Servant Commission',
    youtubeId: '1O4bT3Zt7sM',
    youtubeUrl: 'https://www.youtube.com/watch?v=1O4bT3Zt7sM',
    videoUrl: 'https://www.youtube.com/watch?v=1O4bT3Zt7sM',
    studyNotes: `1. Following Jesus: Personal But Never Private
Castaway Movie Illustration: Tom Hanks stranded on an island befriending Wilson the volleyball. People were created to live in communion with God and one another.

2. Remember the Great Commission (Matthew 28:16-20)
Jesus gathered all eleven disciples together on the mountain in Galilee. One person cannot complete the Great Commission alone. Jesus modelled community with His disciples.

3. The Right Community Helps Us Deal with Sin and Correction (Matthew 18:15-20)
Jesus calls us into agreement. Where two or three are gathered in His name, He is in our midst. Healthy community operates in marriages, churches, small groups, and prayer partnerships.

4. Bless the Community More Than It Blesses You (Acts 1:8)
True growth occurs when we transition from being kingdom consumers to kingdom servants. The great commission calls us to use our talents to bless others. What is stopping you from being an "ALL HANDS ON DECK" type of servant?`,
    notesContent: `1. Following Jesus: Personal But Never Private
Castaway Movie Illustration: Tom Hanks stranded on an island befriending Wilson the volleyball. People were created to live in communion with God and one another.

2. Remember the Great Commission (Matthew 28:16-20)
Jesus gathered all eleven disciples together on the mountain in Galilee. One person cannot complete the Great Commission alone. Jesus modelled community with His disciples.

3. The Right Community Helps Us Deal with Sin and Correction (Matthew 18:15-20)
Jesus calls us into agreement. Where two or three are gathered in His name, He is in our midst. Healthy community operates in marriages, churches, small groups, and prayer partnerships.

4. Bless the Community More Than It Blesses You (Acts 1:8)
True growth occurs when we transition from being kingdom consumers to kingdom servants. The great commission calls us to use our talents to bless others. What is stopping you from being an "ALL HANDS ON DECK" type of servant?`,
    questions: [
      'What emotions do you experience when you are isolated or alone for an extended period of time?',
      'What is your honest response when you hear that following Jesus was never intended to be a private relationship?',
      'What is stopping you from fully committing and being an "ALL HANDS ON DECK" servant in YoungFire?'
    ],
    challenge: 'Identify one brother or sister in YoungFire this week and decide to give more than you receive—cook a meal, send scripture encouragement, or commit to a weekly prayer watch together.',
    attachmentUrls: [],
    attachments: [
      { name: 'Blessing_of_Community_Notes.pdf', url: '#', size: '210 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_wednesday_forgiveness',
    title: 'Wednesday Bible Study: The Law of Forgiveness & Confession',
    lessonTitle: 'Wednesday Bible Study: The Law of Forgiveness & Confession',
    seriesTitle: 'Foundations of Spiritual Liberty',
    teachingDate: '2026-09-16',
    dateOrSeason: 'Wednesday Midweek Expository Bible Study',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'Forgiveness is not an emotional suggestion; it is a kingdom command that releases spiritual handcuffs. Exploring altar confession, repentance, and the promise given to the thief on the cross.',
    summary: 'Forgiveness is not an emotional suggestion; it is a kingdom command that releases spiritual handcuffs. Exploring altar confession, repentance, and the promise given to the thief on the cross.',
    scripturePassage: 'Ephesians 4:31–32 & 2 Chronicles 7:14',
    primaryPassage: 'Ephesians 4:31–32 & 2 Chronicles 7:14',
    bookId: 'EPH',
    chapter: 4,
    theme: 'Altar Repentance, Releasing Bitterness & The Equipment to Forgive',
    youtubeId: 'bB4oZlDau4g',
    youtubeUrl: 'https://www.youtube.com/watch?v=bB4oZlDau4g',
    videoUrl: 'https://www.youtube.com/watch?v=bB4oZlDau4g',
    studyNotes: `Scriptural Foundations:
- 2 Chronicles 7:14: "If my people, which are called by my name, shall humble themselves, and pray, and seek my face, and turn from their wicked ways..."
- 1 John 1:8: "If we say that we have no sin, we deceive ourselves, and the truth is not in us."
- Mark 11:25-26 & Matthew 18:35: Forgiving others so our Father in heaven may forgive us.
- Luke 17:3 & Matthew 18:15-17: Brotherly correction in love.
- Ephesians 4:31-32: "Instead, be kind to each other, tenderhearted, forgiving one another, just as God through Christ has forgiven you."

Vital Keys on Forgiveness:
1. When someone does you wrong, don't carry the poison—take it to the altar and purge the bitterness, anger, and sadness.
2. Even if the person who wronged you doesn't ask for forgiveness, your heart must be free before God.
3. When we sin against one another, we sin against God.
4. You cannot effectively correct others while nursing unrepented sin in your own heart.
5. God supplies the spiritual equipment needed to forgive what feels humanly impossible.
6. Unforgiveness handicaps you spiritually, stalling prayer momentum.
7. The Thief on the Cross: Admitted his guilt, recognized Jesus as Lord, asked for mercy, and received Christ's immediate promise of Paradise.`,
    notesContent: `Scriptural Foundations:
- 2 Chronicles 7:14: "If my people, which are called by my name, shall humble themselves, and pray, and seek my face, and turn from their wicked ways..."
- 1 John 1:8: "If we say that we have no sin, we deceive ourselves, and the truth is not in us."
- Mark 11:25-26 & Matthew 18:35: Forgiving others so our Father in heaven may forgive us.
- Luke 17:3 & Matthew 18:15-17: Brotherly correction in love.
- Ephesians 4:31-32: "Instead, be kind to each other, tenderhearted, forgiving one another, just as God through Christ has forgiven you."

Vital Keys on Forgiveness:
1. When someone does you wrong, don't carry the poison—take it to the altar and purge the bitterness, anger, and sadness.
2. Even if the person who wronged you doesn't ask for forgiveness, your heart must be free before God.
3. When we sin against one another, we sin against God.
4. You cannot effectively correct others while nursing unrepented sin in your own heart.
5. God supplies the spiritual equipment needed to forgive what feels humanly impossible.
6. Unforgiveness handicaps you spiritually, stalling prayer momentum.
7. The Thief on the Cross: Admitted his guilt, recognized Jesus as Lord, asked for mercy, and received Christ's immediate promise of Paradise.`,
    questions: [
      'Is there anyone you are currently harboring bitterness or resentment toward?',
      'Why is it easier to point out the sins of others rather than confessing our own at the altar?',
      'How does remembering what Jesus did on the cross give us the equipment to forgive others?'
    ],
    challenge: 'Go to God in private prayer today. Name every person who has caused you grief, release them into God’s hands, and ask the Holy Spirit to cleanse any lingering root of bitterness.',
    attachmentUrls: [],
    attachments: [
      { name: 'Wednesday_Study_Forgiveness_Confession.pdf', url: '#', size: '185 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_success_inside_job',
    title: 'Success Is an Inside Job',
    lessonTitle: 'Success Is an Inside Job',
    seriesTitle: 'Kingdom Character & Leadership Development',
    teachingDate: '2026-09-23',
    dateOrSeason: 'Leadership Intensive',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'A penetrating leadership study on why public success with private failure destroys ministry. True success begins within, rooted in radical obedience, brokenness, and servant character.',
    summary: 'A penetrating leadership study on why public success with private failure destroys ministry. True success begins within, rooted in radical obedience, brokenness, and servant character.',
    scripturePassage: '1 Samuel 16:7 & Matthew 25:35',
    primaryPassage: '1 Samuel 16:7 & Matthew 25:35',
    bookId: '1SA',
    chapter: 16,
    theme: 'Character Over Charisma, The Iceberg Principle & Group Dynamics',
    youtubeId: 'C5q1LSCTD88',
    youtubeUrl: 'https://www.youtube.com/watch?v=C5q1LSCTD88',
    videoUrl: 'https://www.youtube.com/watch?v=C5q1LSCTD88',
    studyNotes: `1. The Iceberg Principle:
The part of the iceberg that does the most damage is below the water surface. King Saul had an external anointing, but was a spiritual wreck on the inside. David didn't look the part to man, but had a heart after God.

2. Chabod vs. Ichabod:
- Ichabod = "No glory, no weight, no splendor."
- Chabod = "The full, heavy weight of the glory of God."
Leaders are not measured by applause; they are weighed in the secret place.
"The difference between victory and defeat is 'I'."

3. Broken Crayons Still Color:
God brings you up to the mountain to see the need before it arrives. When you lose focus, you lose passion. Jesus breaks the bread before He multiplies and gives it. Men of character are trusted with spiritual authority.

4. How to Build Lasting Small Groups (The Popovich / Discipleship Blueprint):
- Forming: Coming together with hunger.
- Storming: Jockeying for position, ego entering in.
- Norming: Everyone needs a clear role; doing everything yourself is a poor way to lead.
- Performing: Operating in shared gifts and scalable care.
- Transforming: Raising ordinary disciples to lead and multiply.`,
    notesContent: `1. The Iceberg Principle:
The part of the iceberg that does the most damage is below the water surface. King Saul had an external anointing, but was a spiritual wreck on the inside. David didn't look the part to man, but had a heart after God.

2. Chabod vs. Ichabod:
- Ichabod = "No glory, no weight, no splendor."
- Chabod = "The full, heavy weight of the glory of God."
Leaders are not measured by applause; they are weighed in the secret place.
"The difference between victory and defeat is 'I'."

3. Broken Crayons Still Color:
God brings you up to the mountain to see the need before it arrives. When you lose focus, you lose passion. Jesus breaks the bread before He multiplies and gives it. Men of character are trusted with spiritual authority.

4. How to Build Lasting Small Groups (The Popovich / Discipleship Blueprint):
- Forming: Coming together with hunger.
- Storming: Jockeying for position, ego entering in.
- Norming: Everyone needs a clear role; doing everything yourself is a poor way to lead.
- Performing: Operating in shared gifts and scalable care.
- Transforming: Raising ordinary disciples to lead and multiply.`,
    questions: [
      'In what ways has your spiritual "below the waterline" life been neglected recently?',
      'Are you living as a public success but struggling with private compromise?',
      'Where is YoungFire currently in the forming, storming, norming, and performing cycle?'
    ],
    challenge: 'Take 15 minutes today to conduct an honest "inside job" audit. Write down 5 things you are grateful for: Grace, Mercy, Jesus Christ, Spiritual Gifts, and His Love.',
    attachmentUrls: [],
    attachments: [
      { name: 'Success_Is_An_Inside_Job_Framework.pdf', url: '#', size: '320 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_sdg_throw_down_staff',
    title: 'SDG: Throw Down Your Staff',
    lessonTitle: 'SDG: Throw Down Your Staff',
    seriesTitle: 'Soli Deo Gloria Series',
    teachingDate: '2026-09-30',
    dateOrSeason: 'YoungFire Sunday Exhortation',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'Soli Deo Gloria—living for the glory of God alone. When God asked Moses what was in his hand, Moses held a shepherd staff representing his career, income, and security. Throwing it down was the turning point of destiny.',
    summary: 'Soli Deo Gloria—living for the glory of God alone. When God asked Moses what was in his hand, Moses held a shepherd staff representing his career, income, and security. Throwing it down was the turning point of destiny.',
    scripturePassage: 'Exodus 4:1–3 & Colossians 3:23–24',
    primaryPassage: 'Exodus 4:1–3 & Colossians 3:23–24',
    bookId: 'EXO',
    chapter: 4,
    theme: 'Total Surrender of Security, Career & Identity to God',
    youtubeId: 'q5m09rqOoxE',
    youtubeUrl: 'https://www.youtube.com/watch?v=q5m09rqOoxE',
    videoUrl: 'https://www.youtube.com/watch?v=q5m09rqOoxE',
    studyNotes: `1. Soli Deo Gloria (SDG):
Remember the "WWJD" craze? Today we examine SDG: Latin for "To the glory of God alone." It is not merely what you do, but WHY you do it and WHO you do it for.

2. The "Whatever" Verses:
Colossians 3:23-24: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." "With all your heart" means extra energy, 100% investment. Even in a summer job digging ditches, you can glorify God.

3. Job 1:21 — Naked I came, blessed be the name of the Lord.
If God took away your phone, technology, or comfort for a week, would you complain or worship? Don't be locked into gadgets more than you are locked into Jesus!

4. Exodus 4:1-3 — Throw Down Your Staff:
The staff was Moses' security and identity as an ordinary shepherd. When he threw it down, it became the instrument of God's miraculous deliverance.
- There is no resurrection without a crucifixion.
- Setbacks are God preparing your comeback.
- David and Svea Flood planted one seed in the Congo; God brought forth a massive revival.
- Thomas Maclellan surrendered his business to Christ; Brad Formsma ("I Like Giving") surrendered his wealth.

"Everything - Jesus = Nothing.
Jesus + Nothing = Everything."`,
    notesContent: `1. Soli Deo Gloria (SDG):
Remember the "WWJD" craze? Today we examine SDG: Latin for "To the glory of God alone." It is not merely what you do, but WHY you do it and WHO you do it for.

2. The "Whatever" Verses:
Colossians 3:23-24: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." "With all your heart" means extra energy, 100% investment. Even in a summer job digging ditches, you can glorify God.

3. Job 1:21 — Naked I came, blessed be the name of the Lord.
If God took away your phone, technology, or comfort for a week, would you complain or worship? Don't be locked into gadgets more than you are locked into Jesus!

4. Exodus 4:1-3 — Throw Down Your Staff:
The staff was Moses' security and identity as an ordinary shepherd. When he threw it down, it became the instrument of God's miraculous deliverance.
- There is no resurrection without a crucifixion.
- Setbacks are God preparing your comeback.
- David and Svea Flood planted one seed in the Congo; God brought forth a massive revival.
- Thomas Maclellan surrendered his business to Christ; Brad Formsma ("I Like Giving") surrendered his wealth.

"Everything - Jesus = Nothing.
Jesus + Nothing = Everything."`,
    questions: [
      'What "staff" are you clutching that God is asking you to throw down on the ground?',
      'Are you working at your daily job and studies as unto the Lord or for human applause?',
      'Could you survive a week without digital distractions to be fully locked into prayer?'
    ],
    challenge: 'Surrender your personal agenda to Jesus today. Write down the one area of security you’ve withheld from God and verbally pray: "Lord, I throw down my staff—use my life for Your glory alone."',
    attachmentUrls: [],
    attachments: [
      { name: 'SDG_Throw_Down_Your_Staff_Notes.pdf', url: '#', size: '275 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_praying_waiting_season',
    title: 'Praying in the Waiting Season',
    lessonTitle: 'Praying in the Waiting Season',
    seriesTitle: 'The Secret Place & Intercession',
    teachingDate: '2026-10-07',
    dateOrSeason: 'Midweek Prayer Room Teaching',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'When waiting on God feels overwhelming, praying personalized Scripture anchors your soul and silences enemy lies. Finding spiritual purpose and community intercession in the waiting room.',
    summary: 'When waiting on God feels overwhelming, praying personalized Scripture anchors your soul and silences enemy lies. Finding spiritual purpose and community intercession in the waiting room.',
    scripturePassage: 'Philippians 4:8 & James 5:16',
    primaryPassage: 'Philippians 4:8 & James 5:16',
    bookId: 'PHP',
    chapter: 4,
    theme: 'Praying Personalized Scripture, Finding Purpose in the Valley',
    youtubeId: 'bB4oZlDau4g',
    youtubeUrl: 'https://www.youtube.com/watch?v=bB4oZlDau4g',
    videoUrl: 'https://www.youtube.com/watch?v=bB4oZlDau4g',
    studyNotes: `1. Pray Personalized Scripture:
When you do not know what else to pray, turn directly to the Bible and pray Scripture in the first person. Search for a passage that counters the specific lie you are wrestling with.
Philippians 4:8 Guide: "If it is not true, noble, right, pure, lovely, or admirable—Lord, help me choose not to think on such things!"

2. Pray for Purpose in Waiting:
- 1 John 5:14: "And we are confident that He hears us whenever we ask for anything that pleases Him."
- John 15:7: "If you remain in Me and My words remain in you, ask whatever you wish, and it will be done for you."
Find value in the valley. God does some of His deepest foundation work in the hidden seasons.

3. Pray for Each Other:
James 5:16: "Confess your sins to each other and pray for each other so that you may be healed. The earnest prayer of a righteous person has great power and produces wonderful results."
We cannot navigate the waiting season as lone wolves.`,
    notesContent: `1. Pray Personalized Scripture:
When you do not know what else to pray, turn directly to the Bible and pray Scripture in the first person. Search for a passage that counters the specific lie you are wrestling with.
Philippians 4:8 Guide: "If it is not true, noble, right, pure, lovely, or admirable—Lord, help me choose not to think on such things!"

2. Pray for Purpose in Waiting:
- 1 John 5:14: "And we are confident that He hears us whenever we ask for anything that pleases Him."
- John 15:7: "If you remain in Me and My words remain in you, ask whatever you wish, and it will be done for you."
Find value in the valley. God does some of His deepest foundation work in the hidden seasons.

3. Pray for Each Other:
James 5:16: "Confess your sins to each other and pray for each other so that you may be healed. The earnest prayer of a righteous person has great power and produces wonderful results."
We cannot navigate the waiting season as lone wolves.`,
    questions: [
      'What is the last thing you prayed about—do your prayers change or repeat?',
      'What specific Scripture verse can you personalize today against anxiety or discouragement?',
      'How can we carry each other’s burdens while waiting for God’s breakthrough?'
    ],
    challenge: 'Take Philippians 4:8 or Joshua 1:5 and write it out as a personal declaration. Pray it aloud three times every day this week.',
    attachmentUrls: [],
    attachments: [
      { name: 'Praying_In_The_Waiting_Season_Devotional.pdf', url: '#', size: '190 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_once_saved_always_saved',
    title: 'Once Saved, Always Saved? Child of God vs. God’s Creation',
    lessonTitle: 'Once Saved, Always Saved? Child of God vs. God’s Creation',
    seriesTitle: 'Doctrinal Anchors & Discipleship Truths',
    teachingDate: '2026-10-14',
    dateOrSeason: 'Sunday Discipleship Forum',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'Investigating biblical salvation: child of God versus creation, the security of God’s unbreakable covenant in Christ, and why eternal life is never a license to walk in sinful compromise.',
    summary: 'Investigating biblical salvation: child of God versus creation, the security of God’s unbreakable covenant in Christ, and why eternal life is never a license to walk in sinful compromise.',
    scripturePassage: 'Ephesians 1:4–8 & John 10:28–30',
    primaryPassage: 'Ephesians 1:4–8 & John 10:28–30',
    bookId: 'EPH',
    chapter: 1,
    theme: 'Eternal Security, Adoption in Grace & Holy Accountability',
    youtubeId: 'jD36AIKAqp4',
    youtubeUrl: 'https://www.youtube.com/watch?v=jD36AIKAqp4',
    videoUrl: 'https://www.youtube.com/watch?v=jD36AIKAqp4',
    studyNotes: `The Core Inquiry:
What does it mean to be saved? Can we lose our salvation?
Matthew 7:21-23 warns: "Not everyone who calls out to me 'Lord! Lord!' will enter the Kingdom of Heaven. Only those who actually do the will of my Father..."

1. Our Salvation Is Eternal (Ephesians 1:4-8):
Even before He made the world, God loved us and chose us in Christ to be holy. He adopted us into His family through Jesus Christ and purchased our redemption with His blood.

2. Salvation Is Not Based on Works (Ephesians 2:8-10):
It is the gift of God so that no one can boast. We are His workmanship, created anew for good works that He planned beforehand.

3. Secure in the Father’s Grasp (John 10:28-30 & Romans 8:38):
"No one can snatch them out of My Father’s hand." Nothing in all creation can separate us from the love of God in Christ Jesus.

4. Does This Mean a Free Pass to Live Carelessly?
Ecclesiastes 11:9: Young people, rejoice in your youth, but know that for all these things God will bring you into judgment. True salvation produces genuine fruit and holy reverence.`,
    notesContent: `The Core Inquiry:
What does it mean to be saved? Can we lose our salvation?
Matthew 7:21-23 warns: "Not everyone who calls out to me 'Lord! Lord!' will enter the Kingdom of Heaven. Only those who actually do the will of my Father..."

1. Our Salvation Is Eternal (Ephesians 1:4-8):
Even before He made the world, God loved us and chose us in Christ to be holy. He adopted us into His family through Jesus Christ and purchased our redemption with His blood.

2. Salvation Is Not Based on Works (Ephesians 2:8-10):
It is the gift of God so that no one can boast. We are His workmanship, created anew for good works that He planned beforehand.

3. Secure in the Father’s Grasp (John 10:28-30 & Romans 8:38):
"No one can snatch them out of My Father’s hand." Nothing in all creation can separate us from the love of God in Christ Jesus.

4. Does This Mean a Free Pass to Live Carelessly?
Ecclesiastes 11:9: Young people, rejoice in your youth, but know that for all these things God will bring you into judgment. True salvation produces genuine fruit and holy reverence.`,
    questions: [
      'What is the difference between being a creature made by God and a child adopted by God?',
      'Why is our security anchored in God’s keeping power rather than our own performance?',
      'How does grace empower us to live holy lives rather than serving as an excuse for compromise?'
    ],
    challenge: 'Memorize Ephesians 2:8-10 this week. Whenever the enemy whispers accusations against your standing in Christ, recite His Word with boldness.',
    attachmentUrls: [],
    attachments: [
      { name: 'Once_Saved_Always_Saved_Study.pdf', url: '#', size: '240 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_lgbtq_questions',
    title: 'LGBTQ+ Questions & Biblical Truth',
    lessonTitle: 'LGBTQ+ Questions & Biblical Truth',
    seriesTitle: 'Cultural Apologetics & Biblical Clarity',
    teachingDate: '2026-10-21',
    dateOrSeason: 'Young Adult Apologetics Night',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'A compassionate, uncompromising conversation tackling questions surrounding sexuality, identity, culture, and biblical truth through the lens of Romans 8 and God’s original design.',
    summary: 'A compassionate, uncompromising conversation tackling questions surrounding sexuality, identity, culture, and biblical truth through the lens of Romans 8 and God’s original design.',
    scripturePassage: 'Romans 8:1–14 & Ephesians 5:5',
    primaryPassage: 'Romans 8:1–14 & Ephesians 5:5',
    bookId: 'ROM',
    chapter: 8,
    theme: 'Flesh vs. Spirit, Compassion in Truth & God’s Design for Sexuality',
    youtubeId: 'I41mcfilEKQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=I41mcfilEKQ',
    videoUrl: 'https://www.youtube.com/watch?v=I41mcfilEKQ',
    studyNotes: `Foundational Scriptural Grounding:
Ephesians 5:5 & Romans 8:1-14: Walking after the Spirit rather than the flesh.

Key Questions Addressed:
1. Can someone in a sexual relationship / same-sex relationship still be a Christian?
God can turn anyone around. Salvation requires recognizing sin, turning away, and trusting Christ. Simon the sorcerer believed and was baptized, yet had to be rebuked to repent of wickedness in his heart.

2. Love Cannot Be Reduced to Sexual Desire:
God is not the author of every human impulse. Our culture reduces love entirely to sex, but biblical love is self-sacrificing, holy, and grounded in truth.

3. Nature vs. Nurture:
God gave humanity free will. Everyone is born with a fallen nature prone to various fleshly appetites. The question is not what our flesh feels, but what God’s Spirit says.

4. God’s Intentional Design:
Genesis establishes male and female with intentional biological and spiritual complementarianism for holy union and reproduction. Gender dysphoria and intersex conditions must be understood with pastoral care and biological clarity without subverting God’s created order.`,
    notesContent: `Foundational Scriptural Grounding:
Ephesians 5:5 & Romans 8:1-14: Walking after the Spirit rather than the flesh.

Key Questions Addressed:
1. Can someone in a sexual relationship / same-sex relationship still be a Christian?
God can turn anyone around. Salvation requires recognizing sin, turning away, and trusting Christ. Simon the sorcerer believed and was baptized, yet had to be rebuked to repent of wickedness in his heart.

2. Love Cannot Be Reduced to Sexual Desire:
God is not the author of every human impulse. Our culture reduces love entirely to sex, but biblical love is self-sacrificing, holy, and grounded in truth.

3. Nature vs. Nurture:
God gave humanity free will. Everyone is born with a fallen nature prone to various fleshly appetites. The question is not what our flesh feels, but what God’s Spirit says.

4. God’s Intentional Design:
Genesis establishes male and female with intentional biological and spiritual complementarianism for holy union and reproduction. Gender dysphoria and intersex conditions must be understood with pastoral care and biological clarity without subverting God’s created order.`,
    questions: [
      'How does society today conflate identity with sexual attraction?',
      'What does it mean to put to death the deeds of the body by the Spirit (Romans 8:13)?',
      'How do we communicate God’s truth with both unwavering conviction and tender compassion?'
    ],
    challenge: 'Pray for friends and family navigating cultural confusion. Stand firm as a light in truth without compromising kindness or biblical integrity.',
    attachmentUrls: [],
    attachments: [
      { name: 'Biblical_Sexuality_Apologetics_Handout.pdf', url: '#', size: '215 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_christmas_five_gifts',
    title: 'Christmas Is Coming: The Five Spiritual Gifts',
    lessonTitle: 'Christmas Is Coming: The Five Spiritual Gifts',
    seriesTitle: 'Advent & Kingdom Realities',
    teachingDate: '2026-10-28',
    dateOrSeason: 'Advent Celebration Service',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'Cutting through the noise of consumerism to reclaim the five lasting gifts Christ brought to humanity: Salvation, Service, Sense, Spirit, and Stability.',
    summary: 'Cutting through the noise of consumerism to reclaim the five lasting gifts Christ brought to humanity: Salvation, Service, Sense, Spirit, and Stability.',
    scripturePassage: 'Isaiah 9:6 & Proverbs 25:19',
    primaryPassage: 'Isaiah 9:6 & Proverbs 25:19',
    bookId: 'ISA',
    chapter: 9,
    theme: 'Looking at the Savior Instead of Shopping for Savings',
    youtubeId: 'KwX1f2gYKZ4',
    youtubeUrl: 'https://www.youtube.com/watch?v=KwX1f2gYKZ4',
    videoUrl: 'https://www.youtube.com/watch?v=KwX1f2gYKZ4',
    studyNotes: `1. Shift the Focus:
Instead of shipping for savings, look at the One who saves! Look at those who are stuck in ministry praise rather than stuck in traffic to shop. Isaiah 55:1-3: "Why spend money for that which is not bread?"

The Five Gifts of Christmas:
1. Salvation: God cared enough to send His only Son.
2. Service: Jesus washed feet in John 13 and called us to serve. We are saved to serve, not saved because we serve.
3. Sense (Wisdom): God gets no glory from foolishness. Like Solomon and the Queen of Sheba, we need sound decisions and holy discernment.
4. Spirit (Resilience): "A righteous man falls seven times, and riseth up again" (Proverbs 24:16). The most jubilant believers are those who know who Jesus is and get back up.
5. Stability / Single-Mindedness: Proverbs 25:19 warns against relying on the unfaithful in trouble like a broken tooth. A double-minded man is unstable in all his ways. Be faithful in your job, church, and walk!`,
    notesContent: `1. Shift the Focus:
Instead of shipping for savings, look at the One who saves! Look at those who are stuck in ministry praise rather than stuck in traffic to shop. Isaiah 55:1-3: "Why spend money for that which is not bread?"

The Five Gifts of Christmas:
1. Salvation: God cared enough to send His only Son.
2. Service: Jesus washed feet in John 13 and called us to serve. We are saved to serve, not saved because we serve.
3. Sense (Wisdom): God gets no glory from foolishness. Like Solomon and the Queen of Sheba, we need sound decisions and holy discernment.
4. Spirit (Resilience): "A righteous man falls seven times, and riseth up again" (Proverbs 24:16). The most jubilant believers are those who know who Jesus is and get back up.
5. Stability / Single-Mindedness: Proverbs 25:19 warns against relying on the unfaithful in trouble like a broken tooth. A double-minded man is unstable in all his ways. Be faithful in your job, church, and walk!`,
    questions: [
      'Which of the five gifts—Salvation, Service, Sense, Spirit, or Stability—do you need most right now?',
      'Are you prone to double-mindedness when pressure arises?',
      'How can you make Christ the undeniable center of your household this season?'
    ],
    challenge: 'Commit to one concrete act of Christian service this week where you expect zero credit or repayment, remembering Jesus already paid it all.',
    attachmentUrls: [],
    attachments: [
      { name: 'Five_Gifts_Christmas_Sermon.pdf', url: '#', size: '260 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_draw_the_line',
    title: 'Chapter 3: Where Do You Draw the Line?',
    lessonTitle: 'Chapter 3: Where Do You Draw the Line?',
    seriesTitle: 'Discipleship Radicalism',
    teachingDate: '2026-11-04',
    dateOrSeason: 'Tuesday Night Small Group Study',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'Where do you draw the line in your devotion to Christ? Exposing the "Burger King Gospel" (have it your way) and calling disciples to be ALL IN with daily cross-bearing.',
    summary: 'Where do you draw the line in your devotion to Christ? Exposing the "Burger King Gospel" (have it your way) and calling disciples to be ALL IN with daily cross-bearing.',
    scripturePassage: 'Luke 9:23 & Matthew 6:24',
    primaryPassage: 'Luke 9:23 & Matthew 6:24',
    bookId: 'LUK',
    chapter: 9,
    theme: 'Self-Denial, Sins of Omission & Escaping the Americanized Gospel',
    youtubeId: 'bB4oZlDau4g',
    youtubeUrl: 'https://www.youtube.com/watch?v=bB4oZlDau4g',
    videoUrl: 'https://www.youtube.com/watch?v=bB4oZlDau4g',
    studyNotes: `1. The Cost of Discipleship:
Luke 9:23: "If any man will come after Me, let him deny himself, and take up his cross daily, and follow Me." The early apostles were martyrs. What does self-denial look like in 2026?

2. The Americanized Gospel:
Subway or Burger King—customizing religion to fit our lifestyle. We cut and paste the parts of Scripture we like and ignore the rest.
"We’ve got just enough Jesus to be informed, not enough to be transformed."
We draw the line at comfort and stop short of total surrender.

3. Matthew 6:24 — No One Can Serve Two Masters:
You cannot serve God and money. Paul explained the divine transaction in 2 Corinthians 5:21: He who knew no sin became sin on our behalf that we might become the righteousness of God in Him.

4. The Rich Young Ruler & Sins of Omission:
We often define righteousness merely as avoiding sins of commission (doing bad things). But righteousness is actively doing what is right. You can do nothing wrong and still do nothing right! Accumulate kingdom experiences, not temporary toys.`,
    notesContent: `1. The Cost of Discipleship:
Luke 9:23: "If any man will come after Me, let him deny himself, and take up his cross daily, and follow Me." The early apostles were martyrs. What does self-denial look like in 2026?

2. The Americanized Gospel:
Subway or Burger King—customizing religion to fit our lifestyle. We cut and paste the parts of Scripture we like and ignore the rest.
"We’ve got just enough Jesus to be informed, not enough to be transformed."
We draw the line at comfort and stop short of total surrender.

3. Matthew 6:24 — No One Can Serve Two Masters:
You cannot serve God and money. Paul explained the divine transaction in 2 Corinthians 5:21: He who knew no sin became sin on our behalf that we might become the righteousness of God in Him.

4. The Rich Young Ruler & Sins of Omission:
We often define righteousness merely as avoiding sins of commission (doing bad things). But righteousness is actively doing what is right. You can do nothing wrong and still do nothing right! Accumulate kingdom experiences, not temporary toys.`,
    questions: [
      'Where have you drawn an unspoken line in your walk with God ("I will obey this far, but no further")?',
      'Are you living on "just enough Jesus to be informed, but not transformed"?',
      'What is a sin of omission in your life—good that you know you should do, but have neglected?'
    ],
    challenge: 'Erase your self-imposed line. Pray Luke 9:23 over your life and ask God to show you what personal comfort you must sacrifice to be ALL IN.',
    attachmentUrls: [],
    attachments: [
      { name: 'Draw_The_Line_Chapter3_Handout.pdf', url: '#', size: '230 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_defense_not_defensive',
    title: 'Be on Defense, Not Defensive',
    lessonTitle: 'Be on Defense, Not Defensive',
    seriesTitle: 'Apostolic Integrity & Resilience',
    teachingDate: '2026-11-11',
    dateOrSeason: 'Brotherhood & Leadership Cohort',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'When your character is attacked or criticized, defensiveness is the reaction of the flesh. Learn how Paul defended his apostolic calling through humility, transparency, and dependence on God.',
    summary: 'When your character is attacked or criticized, defensiveness is the reaction of the flesh. Learn how Paul defended his apostolic calling through humility, transparency, and dependence on God.',
    scripturePassage: '2 Corinthians 1:1–24',
    primaryPassage: '2 Corinthians 1:1–24',
    bookId: '2CO',
    chapter: 1,
    theme: 'Responding to Character Attacks, Sufferings & Transparency in Christ',
    youtubeId: 'rCSwaCZsAHg',
    youtubeUrl: 'https://www.youtube.com/watch?v=rCSwaCZsAHg',
    videoUrl: 'https://www.youtube.com/watch?v=rCSwaCZsAHg',
    studyNotes: `Context of 2 Corinthians:
The church at Corinth struggled with carnality, false teachers, and slander against Paul’s authority. Paul had to explain himself while remaining a humble servant of Christ.

Five Apostolic Principles:
1. Know Your Credentials (v. 1-2):
Know who you represent. Know who you are and whose you are in Christ Jesus.

2. Suffering and Hardships Come with Comfort (v. 3-7):
God comforts us in all our tribulations so that we can comfort others with the very comfort we have received. Remember El Roi—The God Who Sees Me.

3. Rely Completely on the Lord (v. 8-11):
Paul faced trials so severe he despaired of life itself, so that he would learn not to rely on himself, but on God who raises the dead.

4. Be Real and Transparent (v. 12-14):
Our conscience bears witness. Let your integrity speak for itself without spinning narratives.

5. Let Your Actions Speak (v. 15-24):
Stand firm in faith and love rather than domineering over people’s opinions.`,
    notesContent: `Context of 2 Corinthians:
The church at Corinth struggled with carnality, false teachers, and slander against Paul’s authority. Paul had to explain himself while remaining a humble servant of Christ.

Five Apostolic Principles:
1. Know Your Credentials (v. 1-2):
Know who you represent. Know who you are and whose you are in Christ Jesus.

2. Suffering and Hardships Come with Comfort (v. 3-7):
God comforts us in all our tribulations so that we can comfort others with the very comfort we have received. Remember El Roi—The God Who Sees Me.

3. Rely Completely on the Lord (v. 8-11):
Paul faced trials so severe he despaired of life itself, so that he would learn not to rely on himself, but on God who raises the dead.

4. Be Real and Transparent (v. 12-14):
Our conscience bears witness. Let your integrity speak for itself without spinning narratives.

5. Let Your Actions Speak (v. 15-24):
Stand firm in faith and love rather than domineering over people’s opinions.`,
    questions: [
      'How do you instinctively react when someone critiques your leadership or attacks your character?',
      'How has God used your past pain and suffering to minister comfort to someone else?',
      'Are you relying on your own skills and intellect, or on God who raises the dead?'
    ],
    challenge: 'Next time you feel defensive or misunderstood, refuse to fire back. Take it to El Roi, entrust your reputation to the Lord, and respond with gracious transparency.',
    attachmentUrls: [],
    attachments: [
      { name: 'Defense_Not_Defensive_Notes.pdf', url: '#', size: '250 KB', type: 'application/pdf' }
    ],
    canEdit: true
  },
  {
    id: 'lesson_all_in_soli_deo_gloria',
    title: 'All In: Soli Deo Gloria — Living for an Audience of One',
    lessonTitle: 'All In: Soli Deo Gloria — Living for an Audience of One',
    seriesTitle: 'The Consecrated Life',
    teachingDate: '2026-11-18',
    dateOrSeason: 'Annual Consecration Gathering',
    facilitator: 'Trent White & Whitney White',
    teachers: 'Trent White & Whitney White (YoungFire Discipleship Leaders)',
    description: 'SDG is the Rosetta Stone of kingdom living. God does not use us because of us, but in spite of us. Moses was the patron saint of second chances, spending 40 years on parole with a purpose.',
    summary: 'SDG is the Rosetta Stone of kingdom living. God does not use us because of us, but in spite of us. Moses was the patron saint of second chances, spending 40 years on parole with a purpose.',
    scripturePassage: 'John 17:4–5 & Romans 8:38',
    primaryPassage: 'John 17:4–5 & Romans 8:38',
    bookId: 'JHN',
    chapter: 17,
    theme: 'Audience of One, Second Chances & The Triumphal Procession',
    youtubeId: 'C5q1LSCTD88',
    youtubeUrl: 'https://www.youtube.com/watch?v=C5q1LSCTD88',
    videoUrl: 'https://www.youtube.com/watch?v=C5q1LSCTD88',
    studyNotes: `1. Living for an Audience of One:
SDG means living for the applause of nail-scarred hands. God does not need our resume; He seeks company in accomplishing His redemptive mission.

2. Moses: The Patron Saint of Second Chances:
At 40, Moses thought he could deliver Israel by killing an Egyptian taskmaster—and ended up a fugitive in Midian for 40 years. Palace 101 was not enough; he had to graduate from Wilderness 101.
At 80 years old, God called him from the burning bush. It is never too late for God's grace to redeem your life!

3. Being on Parole with a Purpose:
Living in unexpected circumstances is like being on parole with divine purpose. Failure is the fertilizer that grows character.

4. The Triumphal Procession:
Roman generals had triumphal processions with captives. Our triumphal procession begins at the foot of the cross. Jesus walked out of His tomb under His own resurrection power! Failure is never final when Christ is your All in All.`,
    notesContent: `1. Living for an Audience of One:
SDG means living for the applause of nail-scarred hands. God does not need our resume; He seeks company in accomplishing His redemptive mission.

2. Moses: The Patron Saint of Second Chances:
At 40, Moses thought he could deliver Israel by killing an Egyptian taskmaster—and ended up a fugitive in Midian for 40 years. Palace 101 was not enough; he had to graduate from Wilderness 101.
At 80 years old, God called him from the burning bush. It is never too late for God's grace to redeem your life!

3. Being on Parole with a Purpose:
Living in unexpected circumstances is like being on parole with divine purpose. Failure is the fertilizer that grows character.

4. The Triumphal Procession:
Roman generals had triumphal processions with captives. Our triumphal procession begins at the foot of the cross. Jesus walked out of His tomb under His own resurrection power! Failure is never final when Christ is your All in All.`,
    questions: [
      'Are you living to impress social media followers or living for an Audience of One?',
      'Do you feel like your mistakes have disqualified you from God’s calling?',
      'How can you celebrate God’s faithfulness in the middle of unexpected detours?'
    ],
    challenge: 'Declare out loud: "Failure is not final. God has me on parole with a purpose." Spend 20 minutes in silence resting in Christ’s complete victory.',
    attachmentUrls: [],
    attachments: [
      { name: 'All_In_Soli_Deo_Gloria_Dossier.pdf', url: '#', size: '310 KB', type: 'application/pdf' }
    ],
    canEdit: true
  }
];
