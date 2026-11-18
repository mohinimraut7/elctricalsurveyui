export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5009').replace(/\/$/, '')

// backend relative photo path → absolute URL
export const fileUrl = (path) => (path ? `${API_URL}${path}` : '')

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  WARD_ENGINEER: 'ward_engineer',
  SURVEYOR: 'surveyor',
  VIEWER: 'viewer',
}

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  ward_engineer: 'Ward Engineer',
  surveyor: 'Surveyor',
  viewer: 'Viewer',
}

// ward_engineer / surveyor ला फक्त स्वतःचा ward
export const WARD_SCOPED = ['ward_engineer', 'surveyor']
export const isWardScoped = (user) => WARD_SCOPED.includes(user?.role)

export const WARDS = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'Ward E', 'Ward F', 'Ward G', 'Ward H', 'Ward I']
export const PURPOSES = ['Street light', 'Garden', 'Pond/Lake', 'Smashan Bhumi', 'Dafan Bhumi', 'Kabrastan']
export const PHASE_TYPES = ['Single Phase', 'Three Phase']
export const POLE_TYPES = ['GI Pole', 'Octagonal Pole', 'Tubular Pole', 'Decorative Pole', 'HighMast Pole', 'On MSEB Pole', 'On Wall']
export const LIGHT_TYPES = ['LED (Street Light)', 'LED Flood', 'HPSV(Halogen)', 'Matal Helide(MH)']
export const CABLE_TYPES = ['Underground', 'Overhead']

export const FLAG_INFO = {
  test_entry: { label: 'Test entry', desc: 'Dummy ConsumerID / address (12345, xyz, ss…). Lists मधून default लपवले जातात.', tone: 'bad' },
  missing_image: { label: 'No photo', desc: 'Survey मध्ये meter photo घेतलाच नाही.', tone: 'warn' },
  image_not_available: { label: 'Photo not in data', desc: 'Photo filename आहे, पण MeterData.csv मध्ये actual image नाही.', tone: 'info' },
  missing_address: { label: 'No address', desc: 'Address रिकामा आहे.', tone: 'warn' },
  suspicious_consumer_id: { label: 'Check Consumer ID', desc: 'ConsumerID खूप लहान किंवा खूप मोठा (9–13 digits अपेक्षित).', tone: 'warn' },
  suspicious_light_count: { label: 'Check light count', desc: 'Bracket पेक्षा जास्त lights (उदा. 1-way bracket वर 17) — serial no. टाकल्यासारखे. Totals मध्ये धरले नाहीत.', tone: 'warn' },
  no_matching_meter: { label: 'No matching meter', desc: 'Pole चा ConsumerID कोणत्याही meter शी match होत नाही.', tone: 'info' },
  out_of_area: { label: 'Outside VVCMC', desc: 'Coordinates VVCMC boundary बाहेर.', tone: 'bad' },
  missing_location: { label: 'No GPS', desc: 'Pole ला latitude/longitude नाही.', tone: 'warn' },
  not_in_master_list: { label: 'Not in consumer list', desc: 'ConsumerID ward consumer list (जुन्या app चा master data) मध्ये नाही — नवीन connection किंवा चुकीचा नंबर.', tone: 'info' },
}

export const PAGE_SIZES = [10, 20, 50, 100]
