export type CustomerReview = {
  name: string;
  place: string;
  textEn: string;
  textSi: string;
};

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    name: "Nimali F.",
    place: "Galle",
    textEn: "Print quality is super. Colours came out clear, and the parcel arrived the next day.",
    textSi: "Print quality එක super. වර්ණ ඒ විදිහටම ආවා, ඊළඟ දවසේම parcel එකත් ගෙදරට ආවා.",
  },
  {
    name: "Kasun M.",
    place: "Colombo",
    textEn: "Really affordable. I added one packaging set with the prints and free delivery kicked in.",
    textSi: "ලාභයි set එකක්. Prints එක්ක packaging set එකක් එකතු කරද්දී free deliveryත් හම්බුණා වගේ.",
  },
  {
    name: "Sanduni P.",
    place: "Matara",
    textEn: "Ordered birthday prints for my daughter. Soft paper, neat finish, and shipping was fast.",
    textSi: "දුවගේ birthday prints order කළා. කඩදාසිය soft, finish එක හොඳයි, යවනකමත් හරි වේගයෙන්.",
  },
  {
    name: "Amal J.",
    place: "Negombo",
    textEn: "Passport sheet came clean and matching. No need to run to a shop in town.",
    textSi: "Passport sheet එක පිරිසිදුව ආවා, ඡායාරූප ඔක්කොම එක වගේ. නගරේ shop එකකට යන්න ඕන උනේ නෑ.",
  },
  {
    name: "Ishara D.",
    place: "Ambalangoda",
    textEn: "WhatsApp replies were quick, and the 4×6 album copies look sharp enough for the family book.",
    textSi: "WhatsApp reply ඉක්මනින් ආවා. 4×6 album copies පවුලේ book එකට හොඳට sharp.",
  },
  {
    name: "Tharindu S.",
    place: "Kurunegala",
    textEn: "Good deal for the price. Uploaded from the phone, paid on delivery, parcel reached without damage.",
    textSi: "මිලට ගත්තම ලාභයි. Phone එකෙන් upload කරලා COD දුන්නා, parcel එකත් කැඩිල්ලක් නැතුව ආවා.",
  },
];
