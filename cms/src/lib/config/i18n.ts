// Language/i18n configuration for the CMS
// Supports Bosnian (bs) and English (en)

export const LANGUAGES = {
  bs: { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Translation keys
export const translations = {
  // Common
  common: {
    save: { bs: 'Spremi', en: 'Save' },
    cancel: { bs: 'Odustani', en: 'Cancel' },
    delete: { bs: 'Obriši', en: 'Delete' },
    edit: { bs: 'Uredi', en: 'Edit' },
    add: { bs: 'Dodaj', en: 'Add' },
    search: { bs: 'Pretraži', en: 'Search' },
    loading: { bs: 'Učitavanje...', en: 'Loading...' },
    error: { bs: 'Greška', en: 'Error' },
    success: { bs: 'Uspješno', en: 'Success' },
    confirm: { bs: 'Potvrdi', en: 'Confirm' },
    back: { bs: 'Nazad', en: 'Back' },
    next: { bs: 'Dalje', en: 'Next' },
    yes: { bs: 'Da', en: 'Yes' },
    no: { bs: 'Ne', en: 'No' },
    all: { bs: 'Sve', en: 'All' },
    none: { bs: 'Ništa', en: 'None' },
    actions: { bs: 'Akcije', en: 'Actions' },
    status: { bs: 'Status', en: 'Status' },
    active: { bs: 'Aktivno', en: 'Active' },
    inactive: { bs: 'Neaktivno', en: 'Inactive' },
    name: { bs: 'Naziv', en: 'Name' },
    description: { bs: 'Opis', en: 'Description' },
    created: { bs: 'Kreirano', en: 'Created' },
    updated: { bs: 'Ažurirano', en: 'Updated' },
  },

  // Navigation
  nav: {
    dashboard: { bs: 'Dashboard', en: 'Dashboard' },
    crm: { bs: 'CRM', en: 'CRM' },
    settings: { bs: 'Postavke', en: 'Settings' },
    profile: { bs: 'Moj profil', en: 'My Profile' },
    logout: { bs: 'Odjava', en: 'Logout' },
    exploreSarajevo: { bs: 'Explore Sarajevo', en: 'Explore Sarajevo' },
    pametnoOdabrano: { bs: 'Pametno Odabrano', en: 'Smart Choice' },
    hotspot: { bs: 'Hotspot', en: 'Hotspot' },
    portalContent: { bs: 'Portal sadržaj', en: 'Portal Content' },
    hotspotPregled: { bs: 'Pregled', en: 'Overview' },
    hotspotHeroVideo: { bs: 'Hero video', en: 'Hero video' },
    hotspotHeroBanneri: { bs: 'Hero banneri', en: 'Hero banners' },
    hotspotNewsCarousel: { bs: 'News carousel', en: 'News carousel' },
    hotspotNavigacija: { bs: 'Navigacija', en: 'Navigation' },
    hotspotBlokovi: { bs: 'Blokovi', en: 'Blocks' },
    hotspotPlayWin: { bs: 'Play & Win', en: 'Play & Win' },
    hotspotPametno: { bs: 'Pametno odabrano', en: 'Editor’s picks' },
    hotspotExplore: { bs: 'Explore Sarajevo', en: 'Explore Sarajevo' },
    hotspotKampanje: { bs: 'Kampanje', en: 'Campaigns' },
    hotspotPostavke: { bs: 'Postavke', en: 'Settings' },
  },

  // Entities
  entities: {
    businesses: { bs: 'Biznisi', en: 'Businesses' },
    business: { bs: 'Biznis', en: 'Business' },
    attractions: { bs: 'Atrakcije', en: 'Attractions' },
    attraction: { bs: 'Atrakcija', en: 'Attraction' },
    events: { bs: 'Događaji', en: 'Events' },
    event: { bs: 'Događaj', en: 'Event' },
    categories: { bs: 'Kategorije', en: 'Categories' },
    category: { bs: 'Kategorija', en: 'Category' },
    types: { bs: 'Tipovi', en: 'Types' },
    type: { bs: 'Tip', en: 'Type' },
    sections: { bs: 'Sekcije', en: 'Sections' },
    section: { bs: 'Sekcija', en: 'Section' },
    brands: { bs: 'Brendovi', en: 'Brands' },
    brand: { bs: 'Brend', en: 'Brand' },
    products: { bs: 'Proizvodi', en: 'Products' },
    product: { bs: 'Proizvod', en: 'Product' },
    collections: { bs: 'Kolekcije', en: 'Collections' },
    collection: { bs: 'Kolekcija', en: 'Collection' },
    tags: { bs: 'Tagovi', en: 'Tags' },
    tag: { bs: 'Tag', en: 'Tag' },
    clients: { bs: 'Klijenti', en: 'Clients' },
    client: { bs: 'Klijent', en: 'Client' },
    contacts: { bs: 'Kontakti', en: 'Contacts' },
    contact: { bs: 'Kontakt', en: 'Contact' },
    users: { bs: 'Korisnici', en: 'Users' },
    user: { bs: 'Korisnik', en: 'User' },
  },

  // User roles
  roles: {
    owner: { bs: 'Vlasnik', en: 'Owner' },
    admin: { bs: 'Administrator', en: 'Administrator' },
    moderator: { bs: 'Moderator', en: 'Moderator' },
    employee: { bs: 'Zaposlenik', en: 'Employee' },
  },

  // Settings page
  settings: {
    title: { bs: 'Postavke', en: 'Settings' },
    description: { bs: 'Upravljanje korisnicima i postavkama sistema', en: 'Manage users and system settings' },
    users: { bs: 'Korisnici', en: 'Users' },
    activityLog: { bs: 'Log aktivnosti', en: 'Activity Log' },
    manageUsers: { bs: 'Upravljanje korisnicima', en: 'Manage Users' },
    newUser: { bs: 'Novi korisnik', en: 'New User' },
    addUser: { bs: 'Dodaj korisnika', en: 'Add User' },
    editUser: { bs: 'Uredi korisnika', en: 'Edit User' },
    createUser: { bs: 'Kreiraj korisnika', en: 'Create User' },
    deleteUser: { bs: 'Obriši korisnika', en: 'Delete User' },
    confirmDeleteUser: { bs: 'Da li ste sigurni da želite obrisati ovog korisnika?', en: 'Are you sure you want to delete this user?' },
    assignedSections: { bs: 'Dodijeljene sekcije', en: 'Assigned Sections' },
    language: { bs: 'Jezik', en: 'Language' },
    selectLanguage: { bs: 'Odaberite jezik', en: 'Select Language' },
    role: { bs: 'Uloga', en: 'Role' },
    fullAccess: { bs: 'Potpuni pristup svemu uključujući upravljanje korisnicima', en: 'Full access to everything including user management' },
    contentAccess: { bs: 'Potpuni pristup sadržaju, ne može upravljati korisnicima', en: 'Full content access, cannot manage users' },
    editAssigned: { bs: 'Može uređivati dodijeljen sadržaj', en: 'Can edit assigned content' },
    limitedAccess: { bs: 'Ograničen pristup samo dodijeljenim sekcijama', en: 'Limited access to assigned sections only' },
    userAlreadyExists: { bs: 'Korisnik s ovim emailom već postoji', en: 'User with this email already exists' },
    noActivity: { bs: 'Nema zabilježenih aktivnosti', en: 'No activity recorded' },
  },

  // Profile page
  profile: {
    title: { bs: 'Moj profil', en: 'My Profile' },
    description: { bs: 'Upravljanje osobnim podacima', en: 'Manage your personal information' },
    personalInfo: { bs: 'Osobni podaci', en: 'Personal Information' },
    changePassword: { bs: 'Promjena lozinke', en: 'Change Password' },
    name: { bs: 'Ime', en: 'Name' },
    email: { bs: 'Email adresa', en: 'Email Address' },
    phone: { bs: 'Telefon', en: 'Phone' },
    password: { bs: 'Lozinka', en: 'Password' },
    currentPassword: { bs: 'Trenutna lozinka', en: 'Current Password' },
    newPassword: { bs: 'Nova lozinka', en: 'New Password' },
    confirmPassword: { bs: 'Potvrdite lozinku', en: 'Confirm Password' },
    saveChanges: { bs: 'Spremi promjene', en: 'Save Changes' },
    memberSince: { bs: 'Član od', en: 'Member Since' },
    lastLogin: { bs: 'Zadnja prijava', en: 'Last Login' },
    sectionAccess: { bs: 'Pristup sekcijama', en: 'Section Access' },
    recentActivity: { bs: 'Nedavna aktivnost', en: 'Recent Activity' },
    uploadAvatar: { bs: 'Upload avatar', en: 'Upload Avatar' },
    profileUpdated: { bs: 'Profil uspješno ažuriran!', en: 'Profile updated successfully!' },
    passwordChanged: { bs: 'Lozinka uspješno promijenjena!', en: 'Password changed successfully!' },
    passwordMismatch: { bs: 'Nove lozinke se ne podudaraju', en: 'New passwords do not match' },
    passwordTooShort: { bs: 'Lozinka mora imati najmanje 6 znakova', en: 'Password must be at least 6 characters' },
    viewActivity: { bs: 'Pregled vaše aktivnosti možete vidjeti u', en: 'You can view your activity in' },
  },

  // Dashboard
  dashboard: {
    title: { bs: 'Dashboard', en: 'Dashboard' },
    description: { bs: 'Pregled svih platformi i sadržaja', en: 'Overview of all platforms and content' },
    manageContent: { bs: 'Upravljanje sadržajem', en: 'Manage Content' },
    manageProducts: { bs: 'Upravljanje proizvodima', en: 'Manage Products' },
    manageClients: { bs: 'Upravljanje klijentima', en: 'Manage Clients' },
    mobileAppSettings: { bs: 'Konfiguracija mobilne aplikacije', en: 'Mobile App Configuration' },
  },

  // Actions/Activity
  actions: {
    create: { bs: 'Kreiranje', en: 'Create' },
    update: { bs: 'Ažuriranje', en: 'Update' },
    delete: { bs: 'Brisanje', en: 'Delete' },
    login: { bs: 'Prijava', en: 'Login' },
    logout: { bs: 'Odjava', en: 'Logout' },
    upload: { bs: 'Upload', en: 'Upload' },
    reorder: { bs: 'Promjena redoslijeda', en: 'Reorder' },
  },

  // Form fields
  form: {
    required: { bs: 'Obavezno polje', en: 'Required field' },
    invalidEmail: { bs: 'Nevažeća email adresa', en: 'Invalid email address' },
    selectOption: { bs: 'Odaberite opciju', en: 'Select an option' },
    noResults: { bs: 'Nema rezultata', en: 'No results' },
    uploadImage: { bs: 'Upload slike', en: 'Upload Image' },
    dragDropImage: { bs: 'Povucite i ispustite sliku ili kliknite', en: 'Drag and drop an image or click' },
  },

  // Messages
  messages: {
    savedSuccessfully: { bs: 'Uspješno spremljeno!', en: 'Saved successfully!' },
    deletedSuccessfully: { bs: 'Uspješno obrisano!', en: 'Deleted successfully!' },
    errorOccurred: { bs: 'Došlo je do greške', en: 'An error occurred' },
    confirmDelete: { bs: 'Da li ste sigurni da želite obrisati?', en: 'Are you sure you want to delete?' },
    unsavedChanges: { bs: 'Imate nesačuvane promjene', en: 'You have unsaved changes' },
    unsaved: { bs: 'Nesačuvano', en: 'Unsaved' },
    productSaved: { bs: 'Proizvod sačuvan', en: 'Product saved' },
    errorSaving: { bs: 'Greška pri spremanju', en: 'Error saving' },
    errorLoading: { bs: 'Greška pri učitavanju', en: 'Error loading' },
  },

  // Product form
  productForm: {
    newProduct: { bs: 'Novi proizvod', en: 'New Product' },
    editProduct: { bs: 'Uredi proizvod', en: 'Edit Product' },
    createNewProduct: { bs: 'Kreiraj novi proizvod', en: 'Create new product' },
    basicInfo: { bs: 'Osnovne informacije', en: 'Basic Information' },
    slug: { bs: 'Slug', en: 'Slug' },
    shortDescription: { bs: 'Kratki opis', en: 'Short Description' },
    whyWeRecommend: { bs: 'Zašto preporučujemo', en: 'Why We Recommend' },
    optional: { bs: 'opcionalno', en: 'optional' },
    whyWeRecommendHint: { bs: 'Dodajte ključne razloge zašto preporučujete ovaj proizvod. Prikazat će se kao numerirana lista.', en: 'Add key reasons why you recommend this product. They will be displayed as a numbered list.' },
    reason: { bs: 'Razlog', en: 'Reason' },
    remove: { bs: 'Ukloni', en: 'Remove' },
    addReason: { bs: '+ Dodaj razlog', en: '+ Add Reason' },
    article: { bs: 'Članak', en: 'Article' },
    articlePlaceholder: { bs: 'Unesite sadržaj članka...', en: 'Enter article content...' },
    priceAndLink: { bs: 'Cijena i link', en: 'Price & Link' },
    price: { bs: 'Cijena', en: 'Price' },
    currency: { bs: 'Valuta', en: 'Currency' },
    purchaseLink: { bs: 'Link za kupovinu', en: 'Purchase Link' },
    buttonText: { bs: 'Tekst dugmeta', en: 'Button Text' },
    buyNow: { bs: 'Kupi odmah', en: 'Buy Now' },
    images: { bs: 'Slike', en: 'Images' },
    mainImage: { bs: 'Glavna slika', en: 'Main Image' },
    imageAltText: { bs: 'Alt tekst slike', en: 'Image Alt Text' },
    imageAltPlaceholder: { bs: 'Opis slike za pristupačnost', en: 'Image description for accessibility' },
    imageGallery: { bs: 'Galerija slika', en: 'Image Gallery' },
    publishing: { bs: 'Objava', en: 'Publishing' },
    published: { bs: 'Objavljeno', en: 'Published' },
    featuredProduct: { bs: 'Istaknuti proizvod', en: 'Featured Product' },
    featuredHint: { bs: 'Istaknuti proizvodi se prikazuju na početnoj stranici', en: 'Featured products are displayed on the homepage' },
    displayPriority: { bs: 'Prioritet prikaza', en: 'Display Priority' },
    priorityPlaceholder: { bs: 'Veći broj = veći prioritet', en: 'Higher number = higher priority' },
    priorityHint: { bs: 'Koristi se za sortiranje - veći broj znači višu poziciju na listi', en: 'Used for sorting - higher number means higher position in list' },
    create: { bs: 'Kreiraj', en: 'Create' },
    noCategories: { bs: 'Nema kategorija', en: 'No categories' },
    selectBrand: { bs: 'Odaberi brend', en: 'Select brand' },
    noTags: { bs: 'Nema tagova', en: 'No tags' },
    noCollections: { bs: 'Nema kolekcija', en: 'No collections' },
  },
} as const;

// Helper function to get translation
export function t(
  key: string,
  lang: LanguageCode = 'bs'
): string {
  const keys = key.split('.');
  let value: unknown = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if not found
    }
  }
  
  if (value && typeof value === 'object' && lang in value) {
    return (value as Record<string, string>)[lang];
  }
  
  return key;
}
