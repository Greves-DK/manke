# Manke – app til hestefolk

Første version med hesteprofiler, dækkenråd ud fra vejret og påmindelser om smed, ormekur, vaccination og stævner. Deling og login kommer i næste trin.

## Den nemme vej på Windows

1. Installér **Node.js (LTS)** fra nodejs.org, hvis du ikke har det.
2. Pak zip-filen ud, og dobbeltklik på **start-windows.bat** i mappen.
3. Første gang installerer den pakker og beder dig logge ind med din Expo-konto.
4. Åbn **Expo Go** på telefonen (log ind med samme konto), og scan QR-koden med kameraet.

Viser Windows en advarsel om filen, så vælg **Flere oplysninger › Kør alligevel**. Spørger Windows om netværksadgang til Node.js, så tryk **Tillad**.

## Kør appen på din telefon (Windows, trin for trin)

1. Installér **Node.js (LTS)** fra nodejs.org og **Git** fra git-scm.com. Luk og åbn VS Code bagefter, så den kan finde dem.
2. Pak zip-filen ud, fx til `Dokumenter\manke`.
3. Åbn mappen i VS Code via **Fil › Åbn mappe**.
4. Åbn en terminal via **Terminal › Ny terminal**. Hvis PowerShell skriver, at scripts er slået fra, så vælg **Command Prompt** i pilen ved siden af plusset i terminalen.
5. Kør disse kommandoer én ad gangen:

   ```
   npm install
   npx expo install --fix
   npx expo login
   npx expo start
   ```

   Ved `npx expo login` logger du ind med din Expo-konto.
6. Hent **Expo Go** på telefonen, og log ind med samme Expo-konto.
7. Scan QR-koden i terminalen med telefonens kamera (iPhone) eller inde i Expo Go (Android). Så åbner appen.

Er telefonen ikke på samme Wi-Fi som computeren, eller blokerer et firmanetværk forbindelsen, så stop med `Ctrl+C` og kør `npx expo start --tunnel`.

### Hvis noget driller

- **"Project is incompatible with this version of Expo Go"**: Expo Go og projektet bruger forskellige versioner af Expo. Kopiér beskeden til Claude, så retter vi versionen.
- **Røde fejl i terminalen ved `npm install`**: Kopiér de sidste linjer til Claude.

## Tests

`npm test` kører testene af dækkenmotoren og vejrberegningen.

## Mapper

- `app/` – skærmene (Expo Router): Hjem, Dækken, Påmindelser, Heste, Del hest, Ny hest og Ny påmindelse
- `src/logic/` – dækkenmotoren og vejrberegningen, ren TypeScript med tests
- `src/data/` – vejrprognose og eksempeldata
- `src/state/` – appens data, gemt på telefonen
- `docs/daekken-regler.md` – reglerne bag dækkenrådet

## Før lancering

- Vejret kommer fra Open-Meteo, som er gratis til ikke-kommercielt brug. Skift til en kommerciel kilde, fx DMI, før appen sælges med abonnement.
- Dækkenrådet er vejledende. Få reglerne set efter af en dyrlæge eller erfarne hestefolk.
- Deling og login kræver en server. Planen er Supabase.
