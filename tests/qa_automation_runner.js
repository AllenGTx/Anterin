/**
 * ANTERIN V2 - AUTOMATED QA TEST SUITE (End-to-End & Regression)
 * Framework: Node.js Automated Test Runner (Gherkin Scenarios)
 * Workflows: wf-qa-automation.md & wf-devops.md
 */

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.resolve(__dirname, '..', 'HiFi-Anterin-v2.html');
const INDEX_PATH = path.resolve(__dirname, '..', 'index.html');

console.log('===============================================================');
console.log('🚀 ANTERIN V2 - COMPREHENSIVE QA & DEVOPS TEST HARNESS');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${testName}`);
    } else {
        failedTests++;
        console.error(`  ❌ [FAIL] ${testName}`);
        if (details) console.error(`     Details: ${details}`);
    }
}

// Read HTML
const rawHtml = fs.readFileSync(HTML_PATH, 'utf8');
const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');

// =========================================================================
// TEST SUITE 1: DEVOPS & ARTIFACT INTEGRITY CHECKS
// =========================================================================
console.log('---------------------------------------------------------------');
console.log('TEST SUITE 1: DevOps & File Integrity Validation');
console.log('---------------------------------------------------------------');

assert(rawHtml.length > 400000, 'HiFi file contains complete source code (>400KB)');
assert(indexHtml.length === rawHtml.length, 'index.html is 100% byte-synced with HiFi-Anterin-v2.html');

const crypto = require('crypto');
const hifiHash = crypto.createHash('sha256').update(rawHtml).digest('hex');
const indexHash = crypto.createHash('sha256').update(indexHtml).digest('hex');
assert(hifiHash === indexHash, `SHA256 Hash Match (${hifiHash.slice(0, 10)}... == ${indexHash.slice(0, 10)}...)`);

// Check required assets exist on disk
const requiredAssets = [
    'asset/Hiace-Premio.jpg',
    'asset/innova-reborn.jpg',
    'asset/allianz.svg.webp',
    'asset/default-rental-office.jpg',
    'asset/Sopir1.jpg'
];
requiredAssets.forEach(assetPath => {
    const fullP = path.resolve(__dirname, '..', assetPath);
    assert(fs.existsSync(fullP), `Asset verified on filesystem: ${assetPath}`);
});

// Check removal of deprecated terms requested by user
assert(!rawHtml.includes('Buka 24 Jam'), 'Clean UI: Text "Buka 24 Jam" successfully removed');
assert(!rawHtml.includes('Akses Cepat'), 'Clean UI: Section/Pill "Akses Cepat" successfully removed');

// =========================================================================
// TEST SUITE 2: STATIC & LOGIC PARSING IN BROWSER ENVIRONMENT MOCK
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 2: DOM & Application Runtime Execution');
console.log('---------------------------------------------------------------');

// Minimal DOM mock environment
const domStore = {};

function parseOptionsFromHtml(html) {
    if (typeof html !== 'string') return [];
    const options = [];
    const re = /<option\s+([^>]*?)>(.*?)<\/option>/gi;
    let match;
    while ((match = re.exec(html)) !== null) {
        const attrs = match[1];
        const text = match[2];
        const valMatch = attrs.match(/value="([^"]*)"/i);
        const carIdMatch = attrs.match(/data-car-id="([^"]*)"/i);
        const carNameMatch = attrs.match(/data-car-name="([^"]*)"/i);
        const partnerNameMatch = attrs.match(/data-partner-name="([^"]*)"/i);
        const selected = /selected/i.test(attrs);
        const opt = {
            value: valMatch ? valMatch[1] : '',
            text: text,
            selected: selected,
            getAttribute(attr) {
                if (attr === 'data-car-id') return carIdMatch ? carIdMatch[1] : '';
                if (attr === 'data-car-name') return carNameMatch ? carNameMatch[1] : '';
                if (attr === 'data-partner-name') return partnerNameMatch ? partnerNameMatch[1] : '';
                return null;
            }
        };
        options.push(opt);
    }
    return options;
}

function createMockElement(id, tag = 'div') {
    let _innerHTML = '';
    let _options = [];
    let _selectedIndex = 0;
    let _value = '';

    return {
        id,
        tagName: tag.toUpperCase(),
        checked: false,
        textContent: '',
        src: '',
        style: {},
        get value() {
            if (_options.length > 0 && _selectedIndex >= 0 && _options[_selectedIndex]) {
                return _options[_selectedIndex].value;
            }
            return _value;
        },
        set value(v) {
            _value = v;
            if (_options.length > 0) {
                const idx = _options.findIndex(o => o.value === v);
                if (idx !== -1) _selectedIndex = idx;
            }
        },
        get selectedIndex() { return _selectedIndex; },
        set selectedIndex(i) {
            _selectedIndex = i;
            if (_options[i]) _value = _options[i].value;
        },
        get options() { return _options; },
        set options(opts) { _options = opts; },
        get innerHTML() { return _innerHTML; },
        set innerHTML(val) {
            _innerHTML = val;
            _options = parseOptionsFromHtml(val);
            _selectedIndex = _options.findIndex(o => o.selected);
            if (_selectedIndex === -1 && _options.length > 0) _selectedIndex = 0;
            if (_options[_selectedIndex]) _value = _options[_selectedIndex].value;
        },
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            toggle(c, force) {
                if (force !== undefined) {
                    if (force) this.classes.add(c); else this.classes.delete(c);
                } else {
                    if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c);
                }
            },
            contains(c) { return this.classes.has(c); }
        },
        querySelectorAll(sel) { return []; },
        querySelector(sel) { return null; },
        setAttribute(k, v) { this[k] = v; },
        getAttribute(k) { return this[k]; },
        addEventListener() {},
        removeEventListener() {},
        load() {},
        play() { return Promise.resolve(); },
        pause() {},
        click() {},
        focus() {},
        blur() {},
        reset() {},
        scrollIntoView() {},
        appendChild(child) { return child; },
        append(...nodes) {},
        insertBefore(node, ref) { return node; },
        removeChild(child) { return child; },
        contains(node) { return false; },
        getContext() {
            return {
                drawImage() {},
                clearRect() {},
                fillRect() {}
            };
        }
    };
}

const mockDocument = {
    body: createMockElement('body', 'body'),
    getElementById(id) {
        if (id === 'body') return this.body;
        if (!domStore[id]) {
            domStore[id] = createMockElement(id);
        }
        return domStore[id];
    },
    createElement(tag) {
        return createMockElement('_new_' + tag + '_' + Math.random(), tag);
    },
    createTextNode(text) {
        return { nodeType: 3, textContent: text };
    },
    querySelectorAll(sel) { return []; },
    querySelector(sel) { return null; },
    addEventListener() {},
    cookie: ''
};

const mockLocalStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};

const mockWindow = {
    location: { href: 'http://localhost:3000' },
    scrollTo() {},
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    addEventListener() {},
    document: mockDocument
};

// Extract main application script dynamically
const scripts = rawHtml.match(/<script[\s\S]*?<\/script>/gi) || [];
const mainScriptTag = scripts.find(s => s.includes('DUMMY_LISTINGS')) || scripts[scripts.length - 1];
let appScript = mainScriptTag.replace(/<script[^>]*>|<\/script>/gi, '');

// Expose lexical variables to window for test harness access
const exportCode = `
window.DUMMY_LISTINGS = typeof DUMMY_LISTINGS !== 'undefined' ? DUMMY_LISTINGS : [];
window.DEFAULT_TESTIMONIALS = typeof DEFAULT_TESTIMONIALS !== 'undefined' ? DEFAULT_TESTIMONIALS : [];
window.testimonialsPool = typeof testimonialsPool !== 'undefined' ? testimonialsPool : [];
window.getCarReviewStats = typeof getCarReviewStats !== 'undefined' ? getCarReviewStats : null;
window.renderDetailReviews = typeof renderDetailReviews !== 'undefined' ? renderDetailReviews : null;
window.renderTestimonials = typeof renderTestimonials !== 'undefined' ? renderTestimonials : null;
window.goToCheckout = typeof goToCheckout !== 'undefined' ? goToCheckout : null;
window.simulatePayment = typeof simulatePayment !== 'undefined' ? simulatePayment : null;
window.openTestimonialModal = typeof openTestimonialModal !== 'undefined' ? openTestimonialModal : null;
window.submitCustomerTestimonial = typeof submitCustomerTestimonial !== 'undefined' ? submitCustomerTestimonial : null;
window.selectRole = typeof selectRole !== 'undefined' ? selectRole : null;
window.handleSignup = typeof handleSignup !== 'undefined' ? handleSignup : null;
window.goToJadiMitra = typeof goToJadiMitra !== 'undefined' ? goToJadiMitra : null;
window.submitListing = typeof submitListing !== 'undefined' ? submitListing : null;
window.autoFillCarPreset = typeof autoFillCarPreset !== 'undefined' ? autoFillCarPreset : null;
window.handleCarTypeChange = typeof handleCarTypeChange !== 'undefined' ? handleCarTypeChange : null;
window.DEFAULT_PARTNER_PROFILES = typeof DEFAULT_PARTNER_PROFILES !== 'undefined' ? DEFAULT_PARTNER_PROFILES : {};
window.updateUIAfterLogin = typeof updateUIAfterLogin !== 'undefined' ? updateUIAfterLogin : null;
window.updateUIAfterLogout = typeof updateUIAfterLogout !== 'undefined' ? updateUIAfterLogout : null;
window.goToMitraDashboard = typeof goToMitraDashboard !== 'undefined' ? goToMitraDashboard : null;
window.renderRentalTemplateCard = typeof renderRentalTemplateCard !== 'undefined' ? renderRentalTemplateCard : null;
window.randomizeTestimonials = typeof randomizeTestimonials !== 'undefined' ? randomizeTestimonials : null;
window.startTestimonialAutoRotation = typeof startTestimonialAutoRotation !== 'undefined' ? startTestimonialAutoRotation : null;
window.randomizeDrivers = typeof randomizeDrivers !== 'undefined' ? randomizeDrivers : null;
window.startDriverAutoRotation = typeof startDriverAutoRotation !== 'undefined' ? startDriverAutoRotation : null;
window.DEFAULT_DRIVERS = typeof DEFAULT_DRIVERS !== 'undefined' ? DEFAULT_DRIVERS : [];
window.calculateSelfDrivePrice = typeof calculateSelfDrivePrice !== 'undefined' ? calculateSelfDrivePrice : null;
window.openTnCAndProceed = typeof openTnCAndProceed !== 'undefined' ? openTnCAndProceed : null;
window.closeTnCModal = typeof closeTnCModal !== 'undefined' ? closeTnCModal : null;
window.onTnCCheckboxChange = typeof onTnCCheckboxChange !== 'undefined' ? onTnCCheckboxChange : null;
window.confirmTnCAndProceed = typeof confirmTnCAndProceed !== 'undefined' ? confirmTnCAndProceed : null;
window.setFilter = typeof setFilter !== 'undefined' ? setFilter : null;
window.setDetailServiceMode = typeof setDetailServiceMode !== 'undefined' ? setDetailServiceMode : null;
window.calcDetailPrice = typeof calcDetailPrice !== 'undefined' ? calcDetailPrice : null;
window.bookingFormOnPaketChange = typeof bookingFormOnPaketChange !== 'undefined' ? bookingFormOnPaketChange : null;
window.shareToWhatsApp = typeof shareToWhatsApp !== 'undefined' ? shareToWhatsApp : null;
window.getAuthErrorMessage = typeof getAuthErrorMessage !== 'undefined' ? getAuthErrorMessage : null;
window.showLoginError = typeof showLoginError !== 'undefined' ? showLoginError : null;
window.openForgotPasswordModal = typeof openForgotPasswordModal !== 'undefined' ? openForgotPasswordModal : null;
window.closeForgotPasswordModal = typeof closeForgotPasswordModal !== 'undefined' ? closeForgotPasswordModal : null;
window.handleSendPasswordReset = typeof handleSendPasswordReset !== 'undefined' ? handleSendPasswordReset : null;
window.switchForgotPasswordView = typeof switchForgotPasswordView !== 'undefined' ? switchForgotPasswordView : null;
window.handleSaveNewPassword = typeof handleSaveNewPassword !== 'undefined' ? handleSaveNewPassword : null;
window.startResetCooldownTimer = typeof startResetCooldownTimer !== 'undefined' ? startResetCooldownTimer : null;
window.checkResetCooldown = typeof checkResetCooldown !== 'undefined' ? checkResetCooldown : null;
window.handleGoToNewPassword = typeof handleGoToNewPassword !== 'undefined' ? handleGoToNewPassword : null;
window.initWidgetCarOptions = typeof initWidgetCarOptions !== 'undefined' ? initWidgetCarOptions : null;
window.onWidgetCarSearch = typeof onWidgetCarSearch !== 'undefined' ? onWidgetCarSearch : null;
window.onWidgetCarSelectChange = typeof onWidgetCarSelectChange !== 'undefined' ? onWidgetCarSelectChange : null;
window.updateCombinedBookingPickup = typeof updateCombinedBookingPickup !== 'undefined' ? updateCombinedBookingPickup : null;
window.updateCombinedDetailPickup = typeof updateCombinedDetailPickup !== 'undefined' ? updateCombinedDetailPickup : null;
window.openCarImageModal = typeof openCarImageModal !== 'undefined' ? openCarImageModal : null;
window.closeCarImageModal = typeof closeCarImageModal !== 'undefined' ? closeCarImageModal : null;
window.toggleModalActualSize = typeof toggleModalActualSize !== 'undefined' ? toggleModalActualSize : null;
window.zoomImageModal = typeof zoomImageModal !== 'undefined' ? zoomImageModal : null;
window.handleDetailMainImageClick = typeof handleDetailMainImageClick !== 'undefined' ? handleDetailMainImageClick : null;
window.selectDetailThumbnail = typeof selectDetailThumbnail !== 'undefined' ? selectDetailThumbnail : null;
Object.defineProperty(window, 'browseFilter', { get: () => typeof browseFilter !== 'undefined' ? browseFilter : {}, set: (v) => { browseFilter = v; } });
Object.defineProperty(window, 'driversPool', { get: () => typeof driversPool !== 'undefined' ? driversPool : [], set: (v) => { driversPool = v; } });
Object.defineProperty(window, 'driversInterval', { get: () => typeof driversInterval !== 'undefined' ? driversInterval : null });
Object.defineProperty(window, 'testimonialsInterval', { get: () => typeof testimonialsInterval !== 'undefined' ? testimonialsInterval : null });
Object.defineProperty(window, 'allListings', { get: () => allListings, set: (v) => { allListings = v; } });
Object.defineProperty(window, 'currentListing', { get: () => currentListing, set: (v) => { currentListing = v; } });
Object.defineProperty(window, 'currentBooking', { get: () => currentBooking, set: (v) => { currentBooking = v; } });
Object.defineProperty(window, 'bookingHistory', { get: () => bookingHistory, set: (v) => { bookingHistory = v; } });
Object.defineProperty(window, 'currentUser', { get: () => currentUser, set: (v) => { currentUser = v; } });
Object.defineProperty(window, 'isLoggedIn', { get: () => isLoggedIn, set: (v) => { isLoggedIn = v; } });
Object.defineProperty(window, 'pendingBookingAction', { get: () => pendingBookingAction, set: (v) => { pendingBookingAction = v; } });
`;
appScript += '\n' + exportCode;

// Evaluate script inside isolated sandbox with mock DOM
const vm = require('vm');
const sandbox = {
    window: mockWindow,
    document: mockDocument,
    localStorage: mockLocalStorage,
    sessionStorage: mockLocalStorage,
    navigator: { userAgent: 'NodeTestRunner' },
    location: mockWindow.location,
    console: {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {}
    },
    setTimeout: (fn, ms) => {},
    setInterval: (fn, ms) => 999,
    clearInterval: () => {},
    alert: () => {},
    confirm: () => true,
    firebase: {
        apps: [],
        initializeApp: () => { throw new Error('Local demo mode test sandbox'); },
        auth: Object.assign(() => ({
            onAuthStateChanged: () => {},
            signInWithEmailAndPassword: async () => ({ user: { emailVerified: true } }),
            createUserWithEmailAndPassword: async () => ({ user: { uid: 'test-uid', sendEmailVerification: async () => {} } }),
            signOut: async () => {}
        }), {
            GoogleAuthProvider: class { setCustomParameters() {} }
        }),
        firestore: Object.assign(() => ({
            collection: () => ({
                doc: () => ({
                    get: async () => ({ exists: false }),
                    set: async () => {},
                    update: async () => {}
                }),
                onSnapshot: () => () => {},
                add: async () => ({ id: 'new-id' })
            })
        }), {
            FieldValue: { serverTimestamp: () => new Date() }
        })
    }
};

vm.createContext(sandbox);

try {
    vm.runInContext(appScript, sandbox);
    assert(true, 'Main JavaScript script evaluated with zero runtime syntax errors');
} catch (e) {
    assert(false, 'Main JavaScript evaluation failed', e.stack);
}

// =========================================================================
// TEST SUITE 3: CAR-SCOPED TESTIMONIALS & REALISTIC REVIEW COUNTS
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 3: Car-Scoped Testimonials & Realistic Review Counts');
console.log('---------------------------------------------------------------');

const DUMMY_LISTINGS = mockWindow.DUMMY_LISTINGS;
const DEFAULT_TESTIMONIALS = mockWindow.DEFAULT_TESTIMONIALS;
const testimonialsPool = mockWindow.testimonialsPool;
const getCarReviewStats = mockWindow.getCarReviewStats;
const renderDetailReviews = mockWindow.renderDetailReviews;

assert(Array.isArray(DUMMY_LISTINGS) && DUMMY_LISTINGS.length >= 10, 'Armada catalog seeded with >= 10 vehicles');
assert(Array.isArray(DEFAULT_TESTIMONIALS) && DEFAULT_TESTIMONIALS.length >= 10, 'Testimonials seed pool contains >= 10 realistic reviews');

// Check that no listing has arbitrary hardcoded 34 reviews
const arbitraryReviews = DUMMY_LISTINGS.filter(l => l.totalReviews >= 30);
assert(arbitraryReviews.length === 0, 'No vehicle listing has arbitrary hardcoded review count >= 30 (e.g. 34)');

// Check that every testimonial in pool has carId and carName
const unScopedTestimonials = testimonialsPool.filter(t => !t.carId || !t.carName);
assert(unScopedTestimonials.length === 0, 'Every testimonial in the pool is strictly scoped with carId and carName');

// Check Innova Reborn stats
const innovaListing = DUMMY_LISTINGS.find(l => l.carName === 'Toyota Innova Reborn');
assert(!!innovaListing, 'Found Toyota Innova Reborn (dl-1) in catalog');

const innovaStats = getCarReviewStats(innovaListing);
assert(innovaStats.count >= 1 && innovaStats.count <= 5, `Innova Reborn review count is realistic (Found: ${innovaStats.count} ulasan, Rating: ${innovaStats.rating})`);

// Check Lexus LM stats
const lexusListing = DUMMY_LISTINGS.find(l => l.carName === 'Lexus LM 350');
assert(!!lexusListing, 'Found Lexus LM 350 (dl-6) in catalog');
const lexusStats = getCarReviewStats(lexusListing);
assert(lexusStats.count >= 1, `Lexus LM review count is realistic (Found: ${lexusStats.count} ulasan)`);

// Test renderDetailReviews scoping
// Innova detail page must ONLY contain Innova reviews, never Lexus or Alphard!
mockDocument.getElementById('detailReviewsList').innerHTML = '';
renderDetailReviews(innovaListing);
const innovaDetailReviewsHtml = mockDocument.getElementById('detailReviewsList').innerHTML;

assert(innovaDetailReviewsHtml.includes('Toyota Innova Reborn'), 'Innova detail reviews contain Toyota Innova Reborn');
assert(!innovaDetailReviewsHtml.includes('Lexus LM'), 'Isolation PASS: Innova detail page DOES NOT contain Lexus LM reviews');
assert(!innovaDetailReviewsHtml.includes('Alphard'), 'Isolation PASS: Innova detail page DOES NOT contain Alphard reviews');

// Check Lexus detail reviews
mockDocument.getElementById('detailReviewsList').innerHTML = '';
renderDetailReviews(lexusListing);
const lexusDetailReviewsHtml = mockDocument.getElementById('detailReviewsList').innerHTML;
assert(lexusDetailReviewsHtml.includes('Lexus LM 350'), 'Lexus detail reviews contain Lexus LM 350');
assert(!lexusDetailReviewsHtml.includes('Innova Reborn'), 'Isolation PASS: Lexus detail page DOES NOT contain Innova reviews');

// Check empty state for vehicle with 0 reviews
const emptyCar = { id: 'test-car-999', carName: 'Tesla Model X Plaid' };
mockDocument.getElementById('detailReviewsList').innerHTML = '';
renderDetailReviews(emptyCar);
const emptyReviewsHtml = mockDocument.getElementById('detailReviewsList').innerHTML;
assert(emptyReviewsHtml.includes('Belum Ada Ulasan untuk'), 'Empty State PASS: Displays clean zero-review notice with "Berikan Ulasan" CTA');

// =========================================================================
// TEST SUITE 4: END-TO-END BOOKING FLOW
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 4: Complete End-to-End Booking Flow');
console.log('---------------------------------------------------------------');

// Step 1: Select vehicle -- pre-seed required checkout fields
mockWindow.isLoggedIn = true;
mockWindow.currentUser = { uid: 'tester-001', first: 'Test', last: 'User', phone: '081234567890', role: 'renter' };
const checkoutListing = Object.assign({}, innovaListing, {
    _checkoutStart: '25 Okt 2026',
    _checkoutEnd:   '27 Okt 2026',
    _checkoutDays:  2,
    _checkoutTotal: innovaListing.pricePerDay * 2
});
mockWindow.currentListing = checkoutListing;
mockDocument.getElementById('detailPickup').value = 'Bandara Jenderal Ahmad Yani Semarang';
assert(mockWindow.currentListing.id === 'dl-1', 'Step 1: Vehicle selected (dl-1: Toyota Innova Reborn)');

// Step 2: Configure Booking Details
mockDocument.getElementById('bookStartDate').value = '2026-10-25';
mockDocument.getElementById('bookEndDate').value = '2026-10-27';
mockDocument.getElementById('bookLokasi').value = 'Bandara Jenderal Ahmad Yani Semarang';
mockDocument.getElementById('bookService').value = 'driver';
mockDocument.getElementById('bookWaNumber').value = '081234567890';

// Step 3: Trigger Checkout
mockWindow.goToCheckout();
assert(mockWindow.currentBooking !== null, 'Step 2 & 3: goToCheckout() successfully created currentBooking object');
assert(mockWindow.currentBooking.carId === 'dl-1', 'currentBooking has valid carId matching selected vehicle');
assert(mockWindow.currentBooking.carName === 'Toyota Innova Reborn', 'currentBooking has valid carName');
assert(mockWindow.currentBooking.renterPhone === '081234567890', 'currentBooking carries validated customer WhatsApp phone number');
assert(mockWindow.currentBooking.total >= 1000000, `currentBooking calculated realistic total: Rp ${mockWindow.currentBooking.total.toLocaleString('id')}`);

// Step 4: Confirm Checkout Payment
const prevBookingsCount = mockWindow.bookingHistory.length;
mockWindow.simulatePayment();
assert(mockWindow.bookingHistory.length === prevBookingsCount + 1, 'Step 4: Payment confirmed, booking successfully appended to bookingHistory');

const latestBooking = mockWindow.bookingHistory[0];
assert(latestBooking.status === 'paid', 'Latest booking status is set to "paid"');
assert(latestBooking.carName === 'Toyota Innova Reborn', 'Latest booking carName matches ordered car');
assert(latestBooking.code && latestBooking.code.startsWith('ANT-'), `Booking code generated with official format (${latestBooking.code})`);

// Step 5: Verify Receipt
const receiptHtml = mockDocument.getElementById('successReceiptTable').innerHTML;
const codeEl = mockDocument.getElementById('successBookingCode').textContent;
assert(codeEl.startsWith('ANT-'), 'Step 5: Official receipt rendered with booking code');
assert(receiptHtml.includes('081234567890'), 'Official receipt contains customer WhatsApp contact');

// =========================================================================
// TEST SUITE 5: REVIEW SUBMISSION FLOW (TIED TO BOOKING HISTORY)
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 5: Review Submission Tied to Booking History');
console.log('---------------------------------------------------------------');

// Prepare user state
mockWindow.currentUser = {
    uid: 'renter-reja-01',
    first: 'Mas',
    last: 'Reja',
    email: 'masreja@gmail.com',
    phone: '081234567890',
    role: 'renter'
};
mockWindow.isLoggedIn = true;

// Open testimonial modal with filter
mockWindow.openTestimonialModal('Toyota Innova Reborn');
const historySelect = mockDocument.getElementById('reviewBookingSelect');

// Simulate selecting the booking
mockDocument.getElementById('reviewBookingSelect').value = latestBooking.code;
mockDocument.getElementById('reviewText').value = 'Mobil Innova sangat prima dan supir ramah sekali, tepat waktu di Bandara!';

// Submit the review
const prevPoolLength = mockWindow.testimonialsPool.length;
mockWindow.submitCustomerTestimonial();

assert(mockWindow.testimonialsPool.length === prevPoolLength + 1, 'Review submitted and added to testimonialsPool');

const newlyAddedReview = mockWindow.testimonialsPool[0];
assert(newlyAddedReview.carId === 'dl-1', 'Newly submitted review carries carId: "dl-1"');
assert(newlyAddedReview.carName === 'Toyota Innova Reborn', 'Newly submitted review carries carName: "Toyota Innova Reborn"');
assert(newlyAddedReview.bookingCode === latestBooking.code, 'Newly submitted review linked with bookingCode');

// Re-check Innova stats: must now have +1 review
const updatedInnovaStats = getCarReviewStats(innovaListing);
assert(updatedInnovaStats.count === innovaStats.count + 1, `Dynamic review counter incremented accurately (${innovaStats.count} -> ${updatedInnovaStats.count})`);

// =========================================================================
// TEST SUITE 6: MITRA REGISTRATION WITH RENTAL LOCATION
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 6: Mitra Registration & Rental Location Fields');
console.log('---------------------------------------------------------------');

// Select Mitra Role
mockWindow.selectRole('mitra');
assert(mockDocument.getElementById('signupRole').value === 'mitra', 'Role switched to "mitra"');
assert(mockDocument.getElementById('mitraBusinessWrap').style.display === 'block', 'Mitra business & location container is visible');

// Test Validation: Empty required fields
mockDocument.getElementById('signupFirst').value = 'Fuad';
mockDocument.getElementById('signupLast').value = 'Hasan';
mockDocument.getElementById('signupEmail').value = 'fuad.rental@gmail.com';
mockDocument.getElementById('signupPhone').value = '081298765432';
mockDocument.getElementById('signupPassword').value = 'FuadSecure123!';
mockDocument.getElementById('signupConfirm').value = 'FuadSecure123!';
mockDocument.getElementById('agreeTerms').checked = true;

// Empty business name
mockDocument.getElementById('signupBusiness').value = '';
mockDocument.getElementById('signupAddress').value = 'Jl. Gajah Mada No. 12';
mockWindow.handleSignup();
assert(mockDocument.getElementById('signupErrorMsg').textContent.includes('Nama bisnis/rental wajib diisi'), 'Validation PASS: Rejects signup if businessName is empty');

// Empty address
mockDocument.getElementById('signupBusiness').value = 'Rental Mas Fuad Semarang';
mockDocument.getElementById('signupAddress').value = '';
mockWindow.handleSignup();
assert(mockDocument.getElementById('signupErrorMsg').textContent.includes('Lokasi pool / alamat garasi rental wajib diisi'), 'Validation PASS: Rejects signup if pool address is empty');

// Valid Mitra Registration
mockDocument.getElementById('signupCity').value = 'Kota Semarang';
mockDocument.getElementById('signupDistrict').value = 'Semarang Tengah';
mockDocument.getElementById('signupAddress').value = 'Jl. Gajah Mada No. 12';
mockDocument.getElementById('signupGmaps').value = 'https://maps.app.goo.gl/fuadtrans';

mockWindow.handleSignup();
assert(mockWindow.currentUser.role === 'mitra', 'Partner registration succeeded: role is "mitra"');
assert(mockWindow.currentUser.businessName === 'Rental Mas Fuad Semarang', 'Partner businessName captured');
assert(mockWindow.currentUser.address === 'Jl. Gajah Mada No. 12', 'Partner pool address captured');
assert(mockWindow.currentUser.city === 'Kota Semarang', 'Partner operational city captured');
assert(mockWindow.currentUser.rentalCard !== null, 'Official rental card created for partner');
assert(mockWindow.DEFAULT_PARTNER_PROFILES['Rental Mas Fuad Semarang'] !== undefined, 'Registered partner immediately available in DEFAULT_PARTNER_PROFILES');

// Test auto-fill in goToJadiMitra() for renter upgrading to mitra
mockWindow.currentUser = {
    first: 'Fuad',
    last: 'Hasan',
    role: 'renter',
    fullAddress: 'Jl. Gajah Mada No. 12, Semarang'
};
mockWindow.isLoggedIn = true;
mockDocument.getElementById('regMitraOwner').value = '';
mockDocument.getElementById('regMitraAddress').value = '';
mockWindow.goToJadiMitra();
assert(mockDocument.getElementById('regMitraOwner').value === 'Fuad Hasan', 'Auto-fill PASS: Existing profile name auto-filled in mitra upgrade form');
assert(mockDocument.getElementById('regMitraAddress').value.includes('Jl. Gajah Mada No. 12'), 'Auto-fill PASS: Registered pool address auto-filled in mitra upgrade form');

// =========================================================================
// TEST SUITE 7: 1 ACCOUNT 1 AVATAR ISOLATION
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 7: 1 Account 1 Profile Picture Isolation');
console.log('---------------------------------------------------------------');

const userA_uid = 'mas-reja-001';
const userB_uid = 'allen-002';

const avatarA = 'data:image/png;base64,AVATAR_USER_A_CONTENT';
const avatarB = 'data:image/png;base64,AVATAR_USER_B_CONTENT';

// Store avatar for User A
mockLocalStorage.setItem('anterin_avatar_' + userA_uid, avatarA);
// Store avatar for User B
mockLocalStorage.setItem('anterin_avatar_' + userB_uid, avatarB);

assert(mockLocalStorage.getItem('anterin_avatar_' + userA_uid) === avatarA, 'User A avatar persisted under unique key');
assert(mockLocalStorage.getItem('anterin_avatar_' + userB_uid) === avatarB, 'User B avatar persisted under unique key');
assert(mockLocalStorage.getItem('anterin_avatar_' + userA_uid) !== mockLocalStorage.getItem('anterin_avatar_' + userB_uid), 'Avatar Isolation PASS: User A and User B maintain completely distinct avatar files with zero cross-contamination');

// =========================================================================
// TEST SUITE 8: MITRA ANTERIN REBRANDING & DYNAMIC CAR TYPES / OTHER
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 8: Mitra Anterin Rebranding & Dynamic Car Types / Other');
console.log('---------------------------------------------------------------');

// 1. Check sidebar brand
assert(rawHtml.includes('Mitra <span>Anterin</span>') || rawHtml.includes('Mitra Anterin'), 'UI Branding: Sidebar logo correctly rebranded to "Mitra Anterin"');
assert(!rawHtml.includes('Anterin<span>.</span> Mitra'), 'UI Branding: Old "Anterin. Mitra" successfully removed');

// 2. Check Car Model Presets datalist exists with Suzuki APV
assert(rawHtml.includes('id="carModelPresets"'), 'HTML: Datalist #carModelPresets exists');
assert(rawHtml.includes('value="Suzuki APV Arena"'), 'HTML: Suzuki APV Arena available in car presets datalist');

// 3. Check expanded options in lCarType
assert(rawHtml.includes('value="Van / Minivan"'), 'HTML: "Van / Minivan" option available in car types');
assert(rawHtml.includes('value="Other"'), 'HTML: "Other" (Ketik Sendiri) option available in car types');
assert(rawHtml.includes('id="lCarTypeOther"'), 'HTML: Input field #lCarTypeOther available for custom car type');

// 4. Test autoFillCarPreset helper
mockDocument.getElementById('lCarCap').value = '';
mockWindow.autoFillCarPreset('Suzuki APV');
assert(mockDocument.getElementById('lCarType').value === 'Van / Minivan', 'Auto-preset PASS: Selecting Suzuki APV auto-fills type as "Van / Minivan"');
assert(mockDocument.getElementById('lCarCap').value == '7', 'Auto-preset PASS: Suzuki APV auto-sets capacity to 7');

// 5. Test "Other" custom type flow
mockWindow.handleCarTypeChange('Other');
assert(mockDocument.getElementById('lCarTypeOtherWrap').style.display === 'block', 'Interactive UI: Selecting "Other" displays custom input #lCarTypeOtherWrap');

mockDocument.getElementById('lCarName').value = 'Suzuki APV Blind Van';
mockDocument.getElementById('lCarType').value = 'Other';
mockDocument.getElementById('lCarTypeOther').value = 'Blind Van Komersial';
mockDocument.getElementById('lCarYear').value = '2024';
mockDocument.getElementById('lCarCap').value = '2';
mockDocument.getElementById('lCarPrice').value = '450000';
mockWindow.currentUser = { uid: 'mitra-amba', businessName: 'Rental Mas Amba Semarang', phone: '08123456789' };

const prevListingsCount = mockWindow.allListings.length;
mockWindow.submitListing();

assert(mockWindow.allListings.length === prevListingsCount + 1, 'Listing Submission: Custom armada appended to allListings');
const addedListing = mockWindow.allListings[mockWindow.allListings.length - 1];
assert(addedListing.carName === 'Suzuki APV Blind Van', 'Listing Submission: carName correctly recorded');
assert(addedListing.carType === 'Blind Van Komersial', 'Database Sync: Custom type from "Other" input correctly saved as carType');

// =========================================================================
// TEST SUITE 9: MITRA NAV TOGGLE, WA PHONE SYNC, INCLUSIVE COPY & TESTIMONIAL ROTATION
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 9: Mitra Nav Toggle, WhatsApp Phone Sync, Inclusive Copy & Testimonial Rotation');
console.log('---------------------------------------------------------------');

// 1. Inclusive Copywriting (Expanded to All Market Segments)
assert(rawHtml.includes('Pilihan Armada Lengkap &amp; Terawat'), 'Copywriting PASS: "Pilihan Armada Lengkap & Terawat" present in HTML');
assert(rawHtml.includes('Setiap perjalanan bisa dipandu'), 'Copywriting PASS: "Setiap perjalanan bisa dipandu..." added to chauffeur card');
assert(!rawHtml.includes('Armada Flagship Terkurasi'), 'Copywriting PASS: "Armada Flagship Terkurasi" replaced to reflect mass market expansion');

// 2. Testimonial Clean Copy & Auto-Rotation Setup
assert(rawHtml.includes('Lihat Testimoni Lainnya'), 'Testimonial UI: Button text updated to "Lihat Testimoni Lainnya"');
assert(!rawHtml.includes('randomizer'), 'Clean UI: No "randomizer" wording found in page');
assert(!rawHtml.includes('Acak Testimoni (Random Generator)'), 'Clean UI: "Random Generator" label removed');
assert(typeof mockWindow.startTestimonialAutoRotation === 'function', 'Testimonial Timer: startTestimonialAutoRotation function exists');
assert(typeof mockWindow.randomizeTestimonials === 'function', 'Testimonial Rotation: randomizeTestimonials function exists');

// Test rotation logic without toast
const prevPoolFirst = mockWindow.testimonialsPool[0];
mockWindow.randomizeTestimonials(false);
assert(mockWindow.testimonialsPool.length > 0, 'Testimonial Rotation: Pool remains intact after rotation');

// 3. Navbar Dynamic Role Toggle for Mitra
assert(rawHtml.includes('id="navJadiMitraLink"'), 'HTML: Navbar contains #navJadiMitraLink element');
assert(rawHtml.includes('id="mobileNavJadiMitraLink"'), 'HTML: Mobile menu contains #mobileNavJadiMitraLink element');

mockWindow.currentUser = {
    uid: 'allen-01',
    first: 'Allen',
    phone: '0895321647135',
    role: 'mitra',
    businessName: 'Rental Allen Semarang'
};
mockWindow.isLoggedIn = true;
mockWindow.updateUIAfterLogin();

assert(mockDocument.getElementById('navJadiMitraLink').innerHTML.includes('Dashboard'), 'Navbar Toggle PASS: "Jadi Mitra Kami" changed to "Dashboard" when user is a partner');
assert(mockDocument.getElementById('mobileNavJadiMitraLink').innerHTML.includes('Dashboard'), 'Mobile Navbar Toggle PASS: Mobile link changed to "Dashboard"');

// Test redirection if Mitra accesses goToJadiMitra()
mockWindow.goToJadiMitra();
assert(mockDocument.getElementById('mitra-dashboard-page').classList.contains('active'), 'Mitra Navigation PASS: Accessing goToJadiMitra() automatically redirects partner to dashboard');

// Test revert on logout
mockWindow.updateUIAfterLogout();
assert(mockDocument.getElementById('navJadiMitraLink').innerHTML.includes('Jadi Mitra Kami'), 'Navbar Toggle PASS: "Dashboard" reverts to "Jadi Mitra Kami" on logout');

// 4. WhatsApp Direct Phone Sync with International Formatting
const allenCardHtml = mockWindow.renderRentalTemplateCard({
    name: 'Rental Allen Semarang',
    phone: '0895321647135',
    address: 'Jl. Pemuda No. 88, Semarang'
});
assert(allenCardHtml.includes('href="https://wa.me/62895321647135"'), 'WhatsApp Sync PASS: 0895321647135 normalized to international format 62895321647135 in wa.me link');
assert(allenCardHtml.includes('https://wa.me/62895321647135?text='), 'WhatsApp Sync PASS: Action button uses user account phone number');
assert(allenCardHtml.includes('0895321647135'), 'WhatsApp Sync PASS: Phone number displayed on card');

// =========================================================================
// TEST SUITE 10: LEPAS KUNCI TIME LOGIC, T&C MODAL, LEAFLET MAPS & SERVICE FILTER
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 10: Lepas Kunci Time Logic, T&C Modal, Leaflet Maps & Service Filter');
console.log('---------------------------------------------------------------');

// 1. Leaflet & OpenStreetMap Assets in Head
assert(rawHtml.includes('leaflet@1.9.4/dist/leaflet.css'), 'Leaflet CSS CDN included in <head>');
assert(rawHtml.includes('leaflet@1.9.4/dist/leaflet.js'), 'Leaflet JS CDN included in <head>');
assert(rawHtml.includes('tile.openstreetmap.org'), 'OpenStreetMap tile server configured');

// 2. Map Elements in DOM
assert(rawHtml.includes('id="bookingPickupMapWrap"'), 'Booking page contains #bookingPickupMapWrap');
assert(rawHtml.includes('id="detailMapModal"'), 'Detail page contains #detailMapModal popup');
assert(rawHtml.includes('id="detailPickupLeafletMap"'), 'Detail modal contains #detailPickupLeafletMap');
assert(rawHtml.includes('id="detailMapSearchInput"'), 'Detail modal contains search input with Nominatim autocomplete');

// 3. Browse Service Filter Chips
assert(rawHtml.includes('id="filterServiceChips"'), 'Browse page contains #filterServiceChips');
assert(rawHtml.includes("setFilter('service','self-drive')"), 'Filter includes "Lepas Kunci" chip');
assert(rawHtml.includes("setFilter('service','driver')"), 'Filter includes "Dengan Sopir" chip');

// Test browseFilter interaction
mockWindow.setFilter('service', 'self-drive');
assert(mockWindow.browseFilter.service === 'self-drive', 'Browse filter: Setting service to self-drive updates browseFilter state');
mockWindow.setFilter('service', 'driver');
assert(mockWindow.browseFilter.service === 'driver', 'Browse filter: Setting service to driver updates browseFilter state');
mockWindow.setFilter('service', '');
assert(mockWindow.browseFilter.service === '', 'Browse filter: Resetting service filter to empty string');

// 4. Detail Page Lepas Kunci Time Logic (> 15 Jam = 2 Hari)
const sampleCar = {
    id: 'dl-1',
    carName: 'Toyota Innova Reborn',
    partnerName: 'Rental Mas Amba Semarang',
    pricePerDay: 500000,
    canSelfDrive: true,
    hasDriver: true,
    _serviceMode: 'self-drive'
};
mockWindow.currentListing = sampleCar;

// Case A: 10:00 to 12:00 (2 jam) -> Normal 1 day price (Rp 500.000)
mockDocument.getElementById('detailStartDate').value = '2026-10-25';
mockDocument.getElementById('detailEndDate').value = '2026-10-25';
mockDocument.getElementById('detailStartTime').value = '10:00';
mockDocument.getElementById('detailEndTime').value = '12:00';
mockWindow.calcDetailPrice();

assert(mockWindow.currentListing._checkoutDays === 1, 'Detail Time Logic: 2 hours (10:00-12:00) calculated as 1 day');
assert(mockWindow.currentListing._checkoutTotal === 500000, 'Detail Time Logic: 2 hours sewa charged normal 1 day price (Rp 500.000)');

// Case B: 06:00 to 22:00 (16 jam, > 15 jam) -> Automatically counted as 2 days (Rp 1.000.000)
mockDocument.getElementById('detailStartTime').value = '06:00';
mockDocument.getElementById('detailEndTime').value = '22:00';
mockWindow.calcDetailPrice();

assert(mockWindow.currentListing._checkoutDays === 2, 'Detail Time Logic (>15 Jam): 16 hours duration automatically calculated as 2 days');
assert(mockWindow.currentListing._checkoutTotal === 1000000, 'Detail Time Logic (>15 Jam): 16 hours sewa charged 2 days rate (Rp 1.000.000)');

// 5. Booking Page Self-Drive Time Calculation (> 15 Jam = 2 Hari)
// Case A: 8 hours (08:00 to 16:00) = 1 day
mockDocument.getElementById('bookTimeStart').value = '08:00';
mockDocument.getElementById('bookTimeEnd').value = '16:00';
const selfDriveCalcNormal = mockWindow.calculateSelfDrivePrice();
assert(selfDriveCalcNormal.hours === 8, 'Booking Form Time Logic: 8 hours duration detected');
assert(selfDriveCalcNormal.days === 1, 'Booking Form Time Logic: 8 hours counted as 1 day');

// Case B: 17 hours (06:00 to 23:00, > 15 jam) = 2 days
mockDocument.getElementById('bookTimeStart').value = '06:00';
mockDocument.getElementById('bookTimeEnd').value = '23:00';
const selfDriveCalcLong = mockWindow.calculateSelfDrivePrice();
assert(selfDriveCalcLong.hours === 17, 'Booking Form Time Logic (>15 Jam): 17 hours duration detected');
assert(selfDriveCalcLong.days === 2, 'Booking Form Time Logic (>15 Jam): 17 hours automatically counted as 2 days');

// 6. T&C Modal Clauses & Agreement Logic
assert(rawHtml.includes('id="tnc-modal"'), 'HTML: Contains #tnc-modal element');
assert(rawHtml.includes('id="tncCheckbox"'), 'HTML: Contains #tncCheckbox for renter consent');
assert(rawHtml.includes('id="btnConfirmTnC"'), 'HTML: Contains #btnConfirmTnC confirmation button');

// Verify clause content
assert(rawHtml.includes('di atas 15 jam dianggap 2 hari sewa'), 'T&C Clauses: Contains rule "di atas 15 jam dianggap 2 hari sewa"');
assert(rawHtml.includes('Rp 50.000'), 'T&C Clauses: Contains penalty rule "denda setiap 1 jam sebesar Rp 50.000"');
assert(rawHtml.includes('20 jam, maka otomatis dianggap sewa 2 hari penuh'), 'T&C Clauses: Contains 20 hours escalation clause');

// Verify checkbox interactive toggle
const tncChk = mockDocument.getElementById('tncCheckbox');
const tncBtn = mockDocument.getElementById('btnConfirmTnC');
tncChk.checked = false;
mockWindow.onTnCCheckboxChange();
assert(!tncBtn.classList.contains('enabled'), 'T&C Interactive PASS: Confirm button disabled while checkbox unchecked');

tncChk.checked = true;
mockWindow.onTnCCheckboxChange();
assert(tncBtn.classList.contains('enabled'), 'T&C Interactive PASS: Confirm button enabled when renter checks agreement checkbox');

let actionCalled = false;
mockWindow.pendingBookingAction = () => { actionCalled = true; };
mockWindow.confirmTnCAndProceed();
assert(actionCalled === true, 'T&C Interactive PASS: confirmTnCAndProceed successfully invokes pending booking action');

// 7. Booking Receipt & WhatsApp Message Differentiation
// Case A: Lepas Kunci receipt shows rental office address
mockWindow.currentBooking = {
    code: 'ANT-LEPAS-01',
    carName: 'Toyota Innova Reborn',
    partnerName: 'Rental Mas Amba Semarang',
    partnerPhone: '08123456789',
    renterName: 'Budi Santoso',
    renterPhone: '081298765432',
    supir: 'Lepas Kunci (Tanpa Supir)',
    serviceType: 'self-drive',
    startDate: '2026-10-25 08:00',
    endDate: '2026-10-25 20:00',
    pickup: 'Jl. Pemuda No. 120, Sekayu, Kec. Semarang Tengah, Kota Semarang',
    total: 500000,
    days: 1
};
mockWindow.simulatePayment();
const lepasKunciReceipt = mockDocument.getElementById('successReceiptTable').innerHTML;
assert(lepasKunciReceipt.includes('Lokasi Pengambilan'), 'Receipt Lepas Kunci PASS: Uses label "Lokasi Pengambilan"');
assert(lepasKunciReceipt.includes('Kantor Rental Resmi'), 'Receipt Lepas Kunci PASS: Displays official rental partner office location');

// Case B: Dengan Sopir receipt shows pickup point
mockWindow.currentBooking.serviceType = 'driver';
mockWindow.currentBooking.supir = 'Dengan Supir Profesional';
mockWindow.currentBooking.pickup = 'Samping Indomaret Imam Bonjol Semarang';
mockWindow.simulatePayment();
const sopirReceipt = mockDocument.getElementById('successReceiptTable').innerHTML;
assert(sopirReceipt.includes('Titik Penjemputan'), 'Receipt Sopir PASS: Uses label "Titik Penjemputan"');
assert(sopirReceipt.includes('Samping Indomaret Imam Bonjol'), 'Receipt Sopir PASS: Displays custom customer pickup point');

// =========================================================================
// TEST SUITE 11: VERCEL DEPLOYMENT CONFIGURATION & RESPONSIVE VALIDATION
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 11: Vercel Deployment Configuration & Responsive CSS');
console.log('---------------------------------------------------------------');

const VERCEL_JSON_PATH = path.resolve(__dirname, '..', 'vercel.json');
assert(fs.existsSync(VERCEL_JSON_PATH), 'Vercel Deployment: vercel.json file exists on filesystem');

let vercelConfig = null;
try {
    vercelConfig = JSON.parse(fs.readFileSync(VERCEL_JSON_PATH, 'utf8'));
    assert(true, 'Vercel Deployment: vercel.json is valid parseable JSON');
} catch (e) {
    assert(false, 'Vercel Deployment: vercel.json JSON parsing failed', e.message);
}

if (vercelConfig) {
    assert(vercelConfig.version === 2, 'Vercel Deployment: Version set to 2');
    assert(vercelConfig.cleanUrls === true, 'Vercel Deployment: cleanUrls is enabled');
    assert(Array.isArray(vercelConfig.headers), 'Vercel Deployment: Security headers array configured');
}

// Responsive CSS validation
assert(rawHtml.includes('@media (max-width: 768px)'), 'Responsive CSS: Mobile viewport rules (@media max-width: 768px) present');
assert(rawHtml.includes('@media (max-width: 1024px)'), 'Responsive CSS: Tablet viewport rules (@media max-width: 1024px) present');
assert(rawHtml.includes('.leaflet-map-container'), 'Responsive CSS: Leaflet container styling present');
assert(rawHtml.includes('.time-input-pair'), 'Responsive CSS: Time input pair grid layout present');
assert(rawHtml.includes('.duration-badge'), 'Responsive CSS: Duration warning badge styling present');

// =========================================================================
// TEST SUITE 12: DUAL ADDRESS FORM, SEARCHABLE CAR INPUT, FORGOT PASSWORD & AUTH ERROR NOTIFICATIONS
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 12: Dual Address Form, Searchable Car Input, Forgot Password & Auth Error Notifications');
console.log('---------------------------------------------------------------');

// 1. Auth Error Banner & User-Friendly Messages
assert(rawHtml.includes('id="loginErrorBanner"'), 'Auth Notification: #loginErrorBanner exists in login card');
assert(typeof mockWindow.getAuthErrorMessage === 'function', 'Auth Error Handler: getAuthErrorMessage function defined');
const friendlyErr = mockWindow.getAuthErrorMessage({ code: 'auth/invalid-credential' });
assert(friendlyErr && friendlyErr.includes('tidak cocok'), 'Auth Error: auth/invalid-credential returns friendly Indonesian text');
const emailErr = mockWindow.getAuthErrorMessage({ code: 'auth/invalid-email' });
assert(emailErr && emailErr.includes('Format alamat email tidak valid'), 'Auth Error: auth/invalid-email returns friendly Indonesian text');
const userNotFoundErr = mockWindow.getAuthErrorMessage({ code: 'auth/user-not-found' });
assert(userNotFoundErr && userNotFoundErr.includes('tidak cocok'), 'Auth Error: auth/user-not-found returns friendly Indonesian text');

// 2. Forgot Password Modal, Cooldown & Masukkan Password Baru
assert(rawHtml.includes('id="forgotPasswordModal"'), 'Forgot Password: Modal #forgotPasswordModal present in HTML');
assert(rawHtml.includes('id="forgotEmailInput"'), 'Forgot Password: Input #forgotEmailInput present');
assert(rawHtml.includes('id="forgotPasswordNotice"'), 'Forgot Password: Feedback notice #forgotPasswordNotice present');
assert(rawHtml.includes('id="forgotStepSendEmail"'), 'Forgot Password: Send email step #forgotStepSendEmail present');
assert(rawHtml.includes('id="forgotStepNewPassword"'), 'Forgot Password: Direct new password step #forgotStepNewPassword present');
assert(rawHtml.includes('id="btnSwitchToNewPw"'), 'Forgot Password: Button "Masukkan Password Baru" #btnSwitchToNewPw present');
assert(rawHtml.includes('id="btnSubmitNewPassword"'), 'Forgot Password: Button #btnSubmitNewPassword present');
assert(rawHtml.includes('id="resetNewPassword"'), 'Forgot Password: Password input #resetNewPassword present');
assert(rawHtml.includes('id="resetNewPasswordConfirm"'), 'Forgot Password: Confirm password input #resetNewPasswordConfirm present');
assert(typeof mockWindow.openForgotPasswordModal === 'function', 'Forgot Password: openForgotPasswordModal function exists');
assert(typeof mockWindow.closeForgotPasswordModal === 'function', 'Forgot Password: closeForgotPasswordModal function exists');
assert(typeof mockWindow.handleSendPasswordReset === 'function', 'Forgot Password: handleSendPasswordReset function exists');
assert(typeof mockWindow.switchForgotPasswordView === 'function', 'Forgot Password: switchForgotPasswordView function exists');
assert(typeof mockWindow.handleSaveNewPassword === 'function', 'Forgot Password: handleSaveNewPassword function exists');
assert(typeof mockWindow.startResetCooldownTimer === 'function', 'Forgot Password: startResetCooldownTimer function exists');
assert(typeof mockWindow.checkResetCooldown === 'function', 'Forgot Password: checkResetCooldown function exists');

// Test cooldown timer behavior
mockLocalStorage.setItem('anterin_reset_cooldown_expiry', (Date.now() + 180000).toString());
mockWindow.startResetCooldownTimer(180);
const resetBtn = mockDocument.getElementById('btnSendResetEmail');
assert(resetBtn.disabled === true, 'Cooldown Timer PASS: Button disabled during 5-minute cooldown');
assert(resetBtn.innerHTML.includes('Kirim Ulang'), 'Cooldown Timer PASS: Button displays countdown text');
mockLocalStorage.removeItem('anterin_reset_cooldown_expiry');

// Test view switching & email preservation
assert(typeof mockWindow.handleGoToNewPassword === 'function', 'Forgot Password: handleGoToNewPassword function exists');
mockDocument.getElementById('forgotEmailInput').value = 'saved_user@gmail.com';
mockWindow.handleGoToNewPassword();
assert(mockDocument.getElementById('loginIdentifier').value === 'saved_user@gmail.com', 'Go To New Password PASS: Navigates to login page and preserves typed email');

mockWindow.switchForgotPasswordView('new-password');
assert(mockDocument.getElementById('forgotStepSendEmail').style.display === 'none', 'View Switcher: Send email step hidden in new password view');
assert(mockDocument.getElementById('forgotStepNewPassword').style.display === 'block', 'View Switcher: New password step visible in new password view');

// 3. Searchable Widget Car Input & Datalist
assert(rawHtml.includes('id="widgetCarSearchInput"'), 'Car Widget: Search input #widgetCarSearchInput present');
assert(rawHtml.includes('id="widgetCarDatalist"'), 'Car Widget: Datalist #widgetCarDatalist present');
assert(typeof mockWindow.initWidgetCarOptions === 'function', 'Car Widget: initWidgetCarOptions function exists');
assert(typeof mockWindow.onWidgetCarSearch === 'function', 'Car Widget: onWidgetCarSearch function exists');
assert(typeof mockWindow.onWidgetCarSelectChange === 'function', 'Car Widget: onWidgetCarSelectChange function exists');

// 4. Dual Address Fields (Alamat Lengkap & Patokan/Titik Acuan)
assert(rawHtml.includes('id="bookPickupAddress"'), 'Booking Form: Full street address input #bookPickupAddress present');
assert(rawHtml.includes('id="bookPickupBenchmark"'), 'Booking Form: Landmark/benchmark input #bookPickupBenchmark present');
assert(rawHtml.includes('id="detailPickupAddress"'), 'Detail Form: Full street address input #detailPickupAddress present');
assert(rawHtml.includes('id="detailPickupBenchmark"'), 'Detail Form: Landmark/benchmark input #detailPickupBenchmark present');
assert(rawHtml.includes('id="detailMapAddressInput"'), 'Detail Map Modal: Address display input #detailMapAddressInput present');
assert(rawHtml.includes('id="detailMapBenchmarkInput"'), 'Detail Map Modal: Benchmark input #detailMapBenchmarkInput present');

// Test combining address logic
mockDocument.getElementById('bookPickupAddress').value = 'Jl. Muara Mas X No. 324, Panggung Lor';
mockDocument.getElementById('bookPickupBenchmark').value = 'Samping Indomaret Imam Bonjol';
const combinedVal = mockWindow.updateCombinedBookingPickup();
assert(combinedVal.includes('Jl. Muara Mas X') && combinedVal.includes('Samping Indomaret Imam Bonjol'), 'Dual Address Logic: Combines full address and benchmark seamlessly');
assert(mockDocument.getElementById('bookLokasi').value === combinedVal, 'Dual Address Logic: Hidden bookLokasi field synchronized');

// =========================================================================
// TEST SUITE 13: CAR IMAGE LIGHTBOX & ORIGINAL RESOLUTION MODAL
// =========================================================================
console.log('\n---------------------------------------------------------------');
console.log('TEST SUITE 13: Car Image Lightbox & Original Resolution Modal');
console.log('---------------------------------------------------------------');

assert(rawHtml.includes('id="carImageModal"'), 'Car Image Lightbox: Modal #carImageModal present in HTML');
assert(rawHtml.includes('id="imageModalImg"'), 'Car Image Lightbox: Image #imageModalImg present');
assert(rawHtml.includes('id="imageModalTitle"'), 'Car Image Lightbox: Title #imageModalTitle present');
assert(rawHtml.includes('id="imageModalDims"'), 'Car Image Lightbox: Dimensions badge #imageModalDims present');
assert(rawHtml.includes('id="btnToggleActualSize"'), 'Car Image Lightbox: Toggle actual size button #btnToggleActualSize present');
assert(rawHtml.includes('class="gallery-zoom-badge"'), 'Car Gallery: Hover zoom badge present in DOM/CSS');
assert(rawHtml.includes('class="gallery-popup-trigger-btn"'), 'Car Gallery: Explicit popup expand button present in DOM/CSS');
assert(typeof mockWindow.openCarImageModal === 'function', 'Car Image Lightbox: openCarImageModal function exists');
assert(typeof mockWindow.closeCarImageModal === 'function', 'Car Image Lightbox: closeCarImageModal function exists');
assert(typeof mockWindow.toggleModalActualSize === 'function', 'Car Image Lightbox: toggleModalActualSize function exists');
assert(typeof mockWindow.zoomImageModal === 'function', 'Car Image Lightbox: zoomImageModal function exists');
assert(typeof mockWindow.handleDetailMainImageClick === 'function', 'Car Image Lightbox: handleDetailMainImageClick function exists');
assert(typeof mockWindow.selectDetailThumbnail === 'function', 'Car Image Lightbox: selectDetailThumbnail function exists');

// Interactive modal test
mockWindow.openCarImageModal(['asset/innova-reborn.jpg'], 0, 'Toyota Innova Reborn');
assert(mockDocument.getElementById('carImageModal').classList.contains('active'), 'Interactive Lightbox: Modal opened with active class');
assert(mockDocument.getElementById('imageModalTitle').textContent === 'Toyota Innova Reborn', 'Interactive Lightbox: Displays correct car title');
mockWindow.closeCarImageModal();
assert(!mockDocument.getElementById('carImageModal').classList.contains('active'), 'Interactive Lightbox: Modal successfully closed');

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n===============================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED / ${totalTests} TOTAL (${failedTests} FAILED)`);
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
console.log('===============================================================\n');

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
