# 3.4.1 Cookies

Cookies bruges som session-mekanisme i webbaserede dele af løsningen, specifikt til login og adgang til admin- og partner-dashboards. Efter vellykket login genereres en session cookie på serversiden, som sendes til klienten og gemmes i browseren. Ved efterfølgende HTTP requests sendes cookie automatisk med og bruges til at identificere brugeren.

Sessionen er linket til en bruger-ID i backend og gemmes i serverens hukommelse eller et session store. Dette giver en velkendt og stabil autentifikationsmekanisme, der er velegnet til dele af systemet, der primært bruger HTML-formularer og klassisk navigation.

For at forhindre angreb er cookies konfigureret med følgende relevante sikkerhedsparametre:

- **HttpOnly**: Forhindrer JavaScript-adgang til cookie og beskytter mod XSS (Cross-Site Scripting) angreb. Dette sikrer, at selv hvis en ondsindet script injiceres på siden, kan den ikke læse eller manipulere session cookie'en.

- **Secure**: Sikrer at cookie kun sendes over HTTPS i produktion. Dette beskytter mod session hijacking ved at sikre, at cookie'en er krypteret under transmission og ikke kan aflyttes via man-in-the-middle angreb.

- **SameSite=Strict**: Blokerer cross-site requests og beskytter mod CSRF (Cross-Site Request Forgery) angreb. Dette sikrer, at cookie'en kun sendes med requests fra samme origin, hvilket forhindrer ondsindede websites i at udføre handlinger på vegne af den autentificerede bruger.

Cookies er dog afhængige af server-side state og kan være mindre fleksible i moderne API-baserede arkitekturer. Derfor blev der i andre dele af systemet valgt en token-baseret tilgang, som beskrevet i næste afsnit.
