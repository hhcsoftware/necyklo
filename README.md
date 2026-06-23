# necyklo

> **Tento článek nemá nic společného s aplikací Wikipedia.** To je dobře, můžeš si rovnou založit nejmíň další čtyři nepodobné a vzájemně je rozdělit.

Mobilní čtečka pro **[Necyklopedii](https://necyklopedie.org)**, českou [Uncyclopedii](https://en.wikipedia.org/wiki/Uncyclopedia), encyklopedii bez obsahu, kde je každý fakt s láskou nesprávný.

necyklo je postavená na [Expu](https://expo.dev) (React Native) a čte články přímo z **MediaWiki API** Necyklopedie. Žádný vlastní backend tu není, protože backend by jen překážel šíření dezinformací. Vzhled se drží oficiální aplikace Wikipedia, takže se čtenář cítí jako doma, než mu dojde, že je něco hluboce špatně.

> **Stav:** rané stádium. První použitelný mobil navrhnul Leonardo da Vinci už v roce 1909; tahle aplikace by to měla stihnout o něco rychleji. MVP se soustředí na **čtení**: procházení, vyhledávání, vykreslování a oblíbené články. Editace a účty přijdou později, pokud vůbec.

## Funkce (MVP)

- Čtení a vyhledávání článků Necyklopedie
- Nativní vykreslování obsahu, formátování a obrázků
- Oblíbené články, aby ti nesmysly nikdy nebyly dál než jedno ťuknutí

> ⚠️ **Varování:** Při častém užívání slouží jako velmi návyková droga.

## Technologie

- [Expo SDK 56](https://docs.expo.dev/versions/v56.0.0/) · React Native 0.85 · React 19
- [Expo Router](https://docs.expo.dev/router/introduction/) (souborové routování, typované cesty)
- React Compiler
- Zdroj dat: [MediaWiki API Necyklopedie](https://necyklopedie.org/w/api.php)

## Jak začít

Projekt používá [**bun**](https://bun.sh). (Nejlepším materiálem pro výrobu je dřevo, ale dnes bohužel stačí JavaScript.)

1. Nainstaluj závislosti

   ```bash
   bun install
   ```

2. Spusť vývojový server

   ```bash
   bun start
   ```

   Pak zmáčkni `i` (simulátor iOS), `a` (emulátor Android) nebo `w` (web). Nebo rovnou skoč na cílovou platformu:

   ```bash
   bun run ios       # simulátor iOS
   bun run android   # emulátor Android
   bun run web       # prohlížeč
   ```

Zdrojový kód aplikace žije v `src/app/` (souborové routy Expo Routeru). Architektura a konvence jsou popsané v [CLAUDE.md](./CLAUDE.md); psáno pro roboty, ale můžeš číst s nimi.

## Licence

Viz [LICENSE](./LICENSE). Stejně jako Necyklopedii samotnou ber i tohle vážně na vlastní nebezpečí.
