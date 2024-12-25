<h1 align="center">
  <br>
  <a href="https://github.com/Cabot-bot">
    <img src="https://media.discordapp.net/attachments/886724168933048351/1321325341100343317/rediseno8.png?ex=676cd39e&is=676b821e&hm=e66dad1118e10c756619443bc373b0719f6a8bcd889a4c1080aec0c20de03ac6&=&format=webp&quality=lossless&width=596&height=596" height="150" alt="Cabot">
  </a>
  <br>
  Cabot
  <br>
</h1>

<p align="center">Your Digital Guide to the Occult</p>
<p align="center">
  A versatile, open-source Discord bot for divination, occult studies, and spiritual guidance. <br> Powered by TypeScript, Discord.js, and the Bun runtime.
</p>

<p align="center">
  <a href="#features--commands">✨ Features</a> • 
  <a href="#localization-locales">🌐 Localization</a> • 
  <a href="#contributing-to-locales">🤝 Contributing</a> • 
  <a href="#project-roadmap">📅 Roadmap</a>
</p>

<p align="center">
  <a href="https://discord.gg/Gjjq7MmssX"><img src="https://img.shields.io/badge/Support_Server-JOIN-5865F2?logo=discord"></a> 
  <a href="https://patreon.com/cabot-bot"><img src="https://img.shields.io/badge/Patreon-Cabot-EEB8B6?logo=patreon"></a> 
  <a href="https://www.gnu.org/licenses/agpl-3.0.en.html"><img src="https://img.shields.io/github/license/cabot-bot/cabot"></a>
</p>

---

## **✨ Features & Commands**

### Divination Commands
- **Fortune Telling**: `8ball`, `Fortune`, `Tarot`, `Pendulum`
- **Runes**: `Rune`, `CastRunes`
- **Other Tools**: `Bibliomancy`, `Coin Flip`, `Geomancy`, `I-Ching`, `SpectralCross`, `Psychic`, `Roll`
- **Esoteric Search**: `Hieroglyphs`

### Occult Commands
- **Celestial Insights**: `Horoscope`, `Moon`
- **Symbolic Craft**: `Sigil`, `Find`

### Spiritual Commands
- **Sacred Texts**: `Bible`, `Mythology`
- **Mystic Numbers**: `Numerology`

---

## **📜 Changelog & Technical Reports**

### Update Log
For a complete changelog of Cabot's updates, including new features, fixes, and improvements, see the [`UPDATE.md`](https://github.com/Cabot-bot/Cabot/blob/main/UPDATE.md).

### Technical Report
For an in-depth look at Cabot's technical architecture, features, and design elements, refer to the [`TECHREPORT.md`](https://github.com/Cabot-bot/Cabot/blob/main/TECHREPORT.md).

---

## **🌐 Localization (Locales)**

Cabot currently supports the following languages:
- 🇺🇸 English (en)
- 🇧🇷 Brazilian Portuguese (pt_br)
- 🇪🇸 Spanish (es_latam)

> **Note**: Cabot relies on extensive datasets, which makes full translations challenging. Additional languages will only be added with community support.

### Commands Not Supported by i18n
The following commands are currently excluded from the i18n system due to dataset or technical limitations:

| Command         | Reason                                                                 |
|-----------------|------------------------------------------------------------------------|
| `Bibliomancy`   | Data retrieved via APIs.                                              |
| `CastRunes`     | Complex systems and dataset structures.                               |
| `I-Ching`       | Large dataset still in progress.                                      |
| `Hieroglyphs`   | Field complexity and search functionality limitations.               |
| `Tarot`         | Extensive dataset still undergoing translation.                      |
| `Find`          | High complexity; future localization possible.                       |
| `Horoscope`     | Relies on multiple APIs.                                              |
| `Moon`          | Uses hardcoded data; refactoring needed for localization.            |
| `Bible`         | API-based data retrieval.                                             |
| `Mythology`     | Newly added; data is still being developed.                           |


## **🤝 Contributing to Locales**

We welcome community contributions! Here's how you can help:

1. Use `/locales/en` as the base template.
2. Create a new folder for your language under `/locales` (e.g., `locales/fr` for French).
3. Translate all files while maintaining the structure and naming conventions of the English locale.
4. **Do not translate placeholders** enclosed in `{{ }}` or hyperlinks.
5. Submit your translations as a pull request for review.

---

## **📅 Project Roadmap**

### Completed
- ✅ Add Tarot images
- ✅ Test Tarot image reversals
- ✅ Add I-Ching and Geomancy images
- ✅ Merge `CastRunes` with base rune data
- ✅ Add support for Ogham, Witches, and Mixed runes in `CastRunes`
- ✅ Update emojis for `CastRunes`
- ✅ Implement i18n language system
- ✅ Add translations for:
  - English
  - Spanish
  - Brazilian Portuguese

### Ongoing and Upcoming
- 🚧 Add new Tarot decks
- 🚧 Develop scheduled task embed types (future update)

---

## **🎉 Show Your Support**
If you find Cabot helpful:
- ⭐ Give it a star on [GitHub](https://github.com/Cabot-bot).
- 💬 Join the [Support Server](https://discord.gg/Gjjq7MmssX) to share ideas, report issues, or get help.
- 📢 Spread the word to help Cabot grow!

## **📄 License**
Cabot is open-source software licensed under the [GNU Affero General Public License (AGPL) v3.0](https://www.gnu.org/licenses/agpl-3.0.en.html).  
This license ensures that Cabot remains freely available while encouraging contributions and collaboration.

---

<p align="center">💡 Developed with the care and support of the Cabot community. Join us on <a href="https://discord.gg/Gjjq7MmssX">Discord</a>!</p>
