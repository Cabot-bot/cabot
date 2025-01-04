type MoonPhaseInfo = {
    date: { year: number; month: number; day: number };
    age: number;
    percentage: number;
    distance: number;
    ecliptic: { latitude: number; longitude: number };
    phase: string;
    description: string;
    emoji: string;
    trajectory: string;
    constellation: string;
};
  
// Normalize a value between 0 and 1
const normalize = (v: number): number => (v - Math.floor(v) + 1) % 1;
  
// Helper to determine zodiac constellation based on longitude
const getZodiac = (longitude: number): string => {
    if (longitude < 33.18) return "Aries";
    if (longitude < 51.16) return "Taurus";
    if (longitude < 93.44) return "Gemini";
    if (longitude < 119.48) return "Cancer";
    if (longitude < 135.30) return "Leo";
    if (longitude < 173.34) return "Virgo";
    if (longitude < 224.17) return "Libra";
    if (longitude < 242.57) return "Scorpio";
    if (longitude < 271.26) return "Sagittarius";
    if (longitude < 302.49) return "Capricorn";
    if (longitude < 311.72) return "Aquarius";
    return longitude < 348.58 ? "Pisces" : "Aries";
};
  
// Main function to calculate moon information
export const getMoonInformations = (date: Date): MoonPhaseInfo => {
    const { year, month, day } = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    };
  
    // Julian date calculations
    const yy = year - Math.floor((12 - month) / 10);
    const mm = month + 9 >= 12 ? month - 3 : month + 9;
    const k1 = Math.floor(365.25 * (yy + 4712));
    const k2 = Math.floor(30.6 * mm + 0.5);
    const k3 = Math.floor(Math.floor((yy / 100) + 49) * 0.75) - 38;
  
    let jd = k1 + k2 + day + 59;
    if (jd > 2299160) jd -= k3;
  
    // Calculate moon phase and related parameters
    const ip = normalize((jd - 2451550.1) / 29.530588853);
    const age = ip * 29.53;
    const percentage = Math.round((age / 29.53) * 100);

    // Set default values
    let phase = "Unknown";
    let description = "No information available";
    let emoji = "❓";
    let trajectory = "Undefined";
  
    if (age <  1.84566) {
        phase = 'NEW';
        description = 'In this phase, the Moon lies between the Earth and the Sun, leading to our inability to observe it from Earth. Darkness also embodies the beginning, an instinct for giving birth. Symbolically, the seed lying below the ground represents the start of something new. In this phase, energy is used to build strength and intensity. This is an ideal time for you to clarify your goals and intentions, start new plans or ideas. Simply write it down, or let the universe know about your goals and desires. This power source will be even more powerful if you perform a personal ritual or meditation, start your desires with great enthusiasm.';
        emoji = '🌑';
        trajectory = 'Ascendent';
    } else if (age <  5.53699) {
        phase = 'Waxing crescent';
        description = 'After the New Moon, the bright side of the Moon grows bigger but has not reached half. So the strength and intensity here also increase, representing the germination of the seed. At this stage, we see a translational movement, and hope for something bigger will come. The source of the erupting energy and the source of power moving forward are things that you can use. Moreover, your plans, dreams, and ideas are on the rise, this is the period where you can realize your focus on development and commitment.\nThe time between the Full Moon and the Full Moon is a great time to bring into mind the new intentions you have made during the new moon. This is a time to be positive, motivated, and active.';
        emoji = '🌒';
        trajectory = 'Ascendent';
    } else if (age <  9.22831) {
        phase = 'First quarter';
        description = 'This phase of the moon is called the Half Moon because the bright side of the Moon has reached half and will gradually increase. The seeds have now started to take root, and develop according to the structure of their own species. This moon phase symbolizes the stage of strength, determination, concentration, reevaluation, and commitment to action.\nAlways remember to keep moving forward, regardless of your fears, doubts, or emotions. Use any source of emotional energy into your passion for creativity to accomplish your work and goals.';
        emoji = '🌓';
        trajectory = 'Ascendent';
    } else if (age < 12.91963) {
        phase = 'Waxing gibbous';
        description = 'After the half-moon phase, the bright side of the moon is on the rise, but now it is more than half already. In this phase, the flower buds are about to expand. It represents the development stage when ideas and plans are cultivated and refined before moving on to the next stage. It represents the harvest and attainment. This applies to all things you want to have and want to develop, such as friends, material, skills, and the like.';
        emoji = '🌔';
        trajectory = 'Ascendent';
    } else if (age < 16.61096) {
        phase = 'FULL';
        description = 'At this stage, the Moon, Earth, and the Sun are also aligned as in the New Moon phase, but the Moon is located directly opposite the Sun of the Earth. and the Earth). Therefore, the entire bright, circular region of the Moon is visible from Earth. The seed is now in full bloom. This represents fertility/abundance, change, perfection, and abundance.This phase is called "waning" because the energy is decreasing. This is an ideal time to let go of what no longer supports your noble goals, the things you want to release, release, or end. The "things" here can be anything, from relationships, jobs, thoughts to emotions.\nThis is a time for guidance, healing, and magic.';
        emoji = '🌕';
        trajectory = 'Descendent';
    } else if (age < 20.30228) {
        phase = 'Waning gibbous';
        description = 'After the most brilliant period, the light of the Moon began to diminish. During this period, the bright side of the Moon still accounts for more than half, but is incomplete and will slowly fade away. As the Moon gets smaller, it is a good time to focus on giving up bad habits, pressures, and negative thoughts.\nThis phase of the moon is also known as the "dissemination moon", providing the source of energy for better communication, confession, and fulfillment.';
        emoji = '🌖';
        trajectory = 'Descendent';
    } else if (age < 23.99361) {
        phase = 'Last quarter';
        description = 'At this stage, the Moon is only partly bright, the rest is less than half and will gradually decrease until the light is completely gone so that a New Moon will form again. This is the end of the old cycle, the beginning of a new cycle. This time is for us to separate ourselves from the world and rest; Consider before making a decision and whether you should let go of something.\nThe last crescent moon is also the time to prepare for a new beginning...';
        emoji = '🌗';
        trajectory = 'Descendent';
    } else if (age < 27.68493) {
        phase = 'Waning crescent';
        description = 'The ‘Waning’ refers to the shrinking of the Moon’s illumination and the ‘Crescent’ means less than half of the Moon is illuminated.\nDuring this time take extra care to let go, do not try to control the world around you as this will not bring you peace. Spend time being mindful, going with the flow and surrendering to the world around you.\n– This phases signifies forgiveness surrender –';
        emoji = '🌘';
        trajectory = 'Descendent';
    } else {
        phase = 'NEW';
        description = 'In this phase, the Moon lies between the Earth and the Sun, leading to our inability to observe it from Earth. Darkness also embodies the beginning, an instinct for giving birth. Symbolically, the seed lying below the ground represents the start of something new. In this phase, energy is used to build strength and intensity. This is an ideal time for you to clarify your goals and intentions, start new plans or ideas. Simply write it down, or let the universe know about your goals and desires. This power source will be even more powerful if you perform a personal ritual or meditation, start your desires with great enthusiasm.';
        emoji = '🌑';
        trajectory = 'Ascendent';
    }
  
    // Calculate ecliptic distance and position
    const dp = 2 * Math.PI * normalize((jd - 2451562.2) / 27.55454988);
    const distance = (60.4 - 3.3 * Math.cos(dp) - 0.6 * Math.cos(2 * ip - dp) - 0.5 * Math.cos(2 * ip)) * 6371;
  
    const np = 2 * Math.PI * normalize((jd - 2451565.2) / 27.212220817);
    const latitude = 5.1 * Math.sin(np);
  
    const rp = normalize((jd - 2451555.8) / 27.321582241);
    const longitude = 360 * rp + 6.3 * Math.sin(dp) + 1.3 * Math.sin(2 * ip - dp) + 0.7 * Math.sin(2 * ip);
    const constellation = getZodiac(longitude);
  
    return {
        date: { year, month, day },
        age,
        percentage,
        distance,
        ecliptic: { latitude, longitude },
        phase,
        description,
        emoji,
        trajectory,
        constellation,
    };
};