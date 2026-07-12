"""English bot texts."""

TEXTS: dict[str, str] = {
    # --- Language / menu ---
    "choose_language": "🌐 Choose your language / Выберите язык / Оберіть мову:",
    "lang_changed": "Done! Language switched to English 🇬🇧",
    "welcome": (
        "👋 Hello! This is the <b>CRMino</b> clothing store bot.\n\n"
        "I'll help you pick clothes and pass your request to a manager. "
        "Where do we start?"
    ),
    "menu_title": "🏠 Main menu. Choose an action:",
    # --- Menu buttons ---
    "btn_lead": "🛍 Leave a request",
    "btn_faq": "❓ FAQ",
    "btn_manager": "👤 Contact a manager",
    "btn_change_lang": "🌐 Change language",
    # --- Utility buttons ---
    "btn_back": "⬅️ Back",
    "btn_menu": "🏠 Menu",
    "btn_skip": "⏭ Skip",
    "btn_own": "✍️ Custom",
    "btn_send": "✅ Send",
    "btn_edit": "✏️ Edit",
    "btn_share_contact": "📱 Share my contact",
    # --- Funnel: category ---
    "ask_category": "What are you interested in?",
    "cat_women": "👗 Women",
    "cat_men": "👔 Men",
    "cat_kids": "🧸 Kids",
    "cat_accessories": "👜 Accessories",
    "cat_wholesale": "📦 Wholesale",
    "cat_other": "🔎 Other",
    "ask_category_other": "Please type what exactly you're looking for:",
    # --- Funnel: size ---
    "ask_size": "Tell me your size (if you know it) or skip this step:",
    # --- Funnel: budget ---
    "ask_budget": "What's your budget range?",
    "budget_lt1000": "up to 1000 ₴",
    "budget_1000_3000": "1000–3000 ₴",
    "budget_gt3000": "3000 ₴ and up",
    # --- Funnel: name ---
    "ask_name": "How should I address you? Please type your name:",
    "name_invalid": (
        "Hmm, that name looks unusual 🤔 Please type a name 2 to 50 characters "
        "long, without links or digits. For example: <i>Anna</i>."
    ),
    # --- Funnel: contact ---
    "ask_contact": (
        "Leave a contact — phone or email.\n"
        "Just type it in your reply (for example, <code>+380671234567</code>)."
    ),
    "ask_size_own": "Type your size (for example, 46 or M):",
    "contact_invalid": (
        "That doesn't look like a phone or email 🤔\n"
        "Type a phone like <code>+380XXXXXXXXX</code> "
        "or an email like <code>name@mail.com</code>."
    ),
    # --- Funnel: comment ---
    "ask_comment": (
        "Describe your wishes: model, color, occasion (optional) — "
        "or skip this step."
    ),
    # --- Confirmation ---
    "confirm_title": "Please review your request before sending:",
    "confirm_name": "Name",
    "confirm_contact": "Contact",
    "confirm_category": "Interest",
    "confirm_size": "Size",
    "confirm_budget": "Budget",
    "confirm_comment": "Comment",
    "confirm_empty": "—",
    # --- Final ---
    "lead_saved": (
        "🎉 Thank you, {name}! Your request is received.\n\n"
        "A manager will contact you within <b>{minutes} minutes</b> "
        "during business hours. Meanwhile, you can return to the menu."
    ),
    # --- Manager (for user) ---
    "manager_user_notified": (
        "✅ I've passed your request to a manager.\n"
        "They'll contact you within <b>{minutes} minutes</b> during business hours.\n\n"
        "You can also leave a request so the manager sees the details right away."
    ),
    # --- Intent / misunderstanding ---
    "unknown": (
        "I didn't quite get that 🤔 Use the buttons below — it's faster. "
        "Or type <b>\"manager\"</b> to reach a human."
    ),
    "offer_manager": (
        "Looks like I can't help via text 😔 Let me connect you with a manager — "
        "they'll answer more precisely. Tap the button below."
    ),
    # --- FAQ ---
    "faq_text": (
        "<b>❓ FAQ</b>\n\n"
        "<b>Delivery?</b> Across Ukraine via Nova Poshta, 1–3 days.\n"
        "<b>Payment?</b> Online card or cash on delivery.\n"
        "<b>Exchange/return?</b> 14 days if item and tags are intact.\n"
        "<b>Wholesale?</b> Yes, we have wholesale prices — leave a request marked \"Wholesale\".\n\n"
        "Didn't find your answer? Contact a manager 👇"
    ),
    # --- Errors ---
    "error_generic": (
        "Oops, something went wrong on our side 😔 I've logged the error. "
        "Please try again or return to the menu with /menu."
    ),
}
