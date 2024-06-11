export const cookieName = "minesweeper";
// 10 years, I think the actual max is a year?
export const cookieMaxAge = 1000 * 60 * 60 * 24 * 365 * 10;

// Cookie utilities from PPK https://www.quirksmode.org/js/cookies.html
// Adapted to take in cookie as a parameter
export function extractCookieByName(cookie: string, name: string) {
    var nameEQ = name + "=";
    var ca = cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
