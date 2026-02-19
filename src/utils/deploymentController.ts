/**
 * This file contains the source code for the Deployment Controller as a string.
 * This script is injected into the Web Component (.js) export to handle:
 * 1. Deep linking via ?tag= or ?tileId=
 * 2. URL updating when tiles are clicked
 * 3. Role/Access Tag simulation via ?role=
 * 
 * EDIT THE TILE_BY_TAG OBJECT BELOW TO ADD OR REMOVE STABLE IDENTIFIERS.
 */

export const deploymentControllerSource = `
(function () {
  const COMPONENT_ID = "my-nested-site"; // Fallback ID

  // ---------- FULL TAG -> TILE ID MAP ----------
  // This map allows you to use ?tag=StableName instead of long IDs
  const TILE_BY_TAG = {
    'First30': 'id_1760541461789_tslwr9m',
    'First7': 'id_1764945760686_xm0ssst',
    'Drive': 'id_1765012324979_h239mam',
    'Proc_Prod': 'id_1760541581997_b9drt94',
    'Licensing': 'id_1763664758974_ep61ua2',
    'Appointments': 'id_1763664779793_ia5iw5n',
    'Underwriting': 'id_1760543608433_8bk806u',
    'Underwriting_fundamentals': 'id_1760543634345_r5445tg',
    'Field_underwriting': 'id_1760543631413_lc9ycj4',
    'Advanced_underwriting': 'id_1760543684423_xtzxb8h',
    'Underwriting_AI': 'id_1763740380947_2qgo4e7',
    'Insurance_and_annuity': 'id_1760541903967_0f7896z',
    'Insurance_carriers': 'id_1764946088806_t8dl2jq',
    'JH': 'id_1764946167946_etq09se',
    'JH_Resources': 'id_1764946183604_7k69c92',
    'JH_Vitality': 'id_1765481699993_78iztn7',
    'JH_Aspire': 'id_1767473485663_f24brtx',
    'JH_VitalityPro': 'id_1765552739215_2dr13t0',
    'Ethos': 'id_1764946306921_agywcha',
    'F&G_Life': 'id_1764946461739_zlsim3v',
    'Mutual_of_Omaha': 'id_1764946562751_7ssdlqf',
    'Lincoln': 'id_1764946784232_7ddmst8',
    'Foresters': 'id_1764946932771_d38d3o0',
    'Annuity_carriers': 'id_1764946080872_vc6xu4b',
    'Gradient': 'id_1765547178648_1zqounb',
    'Gradient_getting_started': 'id_1765547252488_77ieqaz',
    'Annuity_Partner_Training': 'id_1767134921135_w3fvtbj',
    'Color_of_money': 'id_1765547253373_cdct9tc',
    'Annuity_info': 'id_1764946996545_6yxfbnm',
    'American': 'id_1764947375859_46h0usc',
    'Athene': 'id_1764947427739_6s1fhg5',
    'Delaware': 'id_1764947461286_y7s608m',
    'EquaTrust': 'id_1764947466789_tc0chzu',
    'F&G_Annuity': 'id_1764947511014_xsjcztx',
    'Lincoln_Financial': 'id_1764948112667_8dg7zi7',
    'North_American': 'id_1764948147797_om9de88',
    'Ocean_View': 'id_1764948247391_6qr1le1',
    'SILAC': 'id_1764948315540_i2zlwgr',
    'Illustrations': 'id_1760543342379_92lagb1',
    'Submitting_business': 'id_1767535161557_6my4137',
    'Commissions': 'id_1765472471766_2cf3c3n',
    'Points': 'id_1767799410476_jro0nir',
    'Benefits': 'id_1763745349230_ms3ayed',
    'Business_building': 'id_1760542991642_euv8lzn',
    'Toolbox': 'id_1760543013823_4rw6ihr',
    'Bank': 'id_1760543079821_q3uwt20',
    'Fuel': 'id_1760543120695_mk7lvjo',
    'BizIQ': 'id_1764932764924_bzzmt1o',
    'Commission_Estimator': 'id_1760660620346_szue07p',
    'Team_Income_Estimator': 'id_1760543835802_g34cy6r',
    'Mastery': 'id_1769538293716_4r5m556',
    'Budget': 'id_1769538382531_yoptpm4',
    'Debt': 'id_1769538383463_br3enul',
    'your_story': 'id_1765015588331_29nv9q7',
    'Term_perm': 'id_1765828240124_qvvbp46',
    'VitalityPro': 'id_1765827100548_o9gvwiu',
    'Sales_videos': 'id_1764949472118_jegbee8',
    'Corporate_materials': 'id_1760693368392_kt9u242',
    'Business_overview': 'id_1765388737605_gcnc3hl',
    'Client_presentation': 'id_1765388750754_s9la1qu',
    'Corporate_Training': 'id_1765388746088_pkqaxxj',
    'FFL_Marketing': 'id_1765389015623_uo0e64e',
    'Onboarding': 'id_1767294732051_25hskql',
    'Incentive_Programs': 'id_1767294935539_47ogrxu',
    'Wingspan': 'id_1767538343223_q5htrjm',
    'Links_Resources': 'id_1768582275830_1prmjcu',
    'Business_Building_Skills': 'id_1760547537934_9jbnjlj',
    'QFT': 'id_1760660725211_32ng1kf'
  };

  // ---------- helpers ----------
  function getParams() {
    return new URLSearchParams(window.location.search);
  }

  function normalizeTag(tag) {
    return (tag || "").trim();
  }

  function setUrlParam(key, value) {
    const url = new URL(window.location.href);
    if (!value) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
    history.replaceState({}, "", url.toString());
  }

  function deepLinkToTile(siteViewer) {
    const params = getParams();

    // Preferred: stable tag, e.g. ?tag=First30
    const tag = normalizeTag(params.get('tag'));
    if (tag) {
      const tileId = TILE_BY_TAG[tag];
      if (tileId) {
        console.log('[DeepLink] tag="' + tag + '" -> tileId="' + tileId + '"');
        siteViewer.navigateToTile(tileId);
        return true;
      }
      console.warn('[DeepLink] Unknown tag "' + tag + '".');
    }

    // Optional: direct id, e.g. ?tileId=id_....
    const tileId = normalizeTag(params.get('tileId'));
    if (tileId) {
      console.log('[DeepLink] tileId="' + tileId + '"');
      siteViewer.navigateToTile(tileId);
      return true;
    }

    return false;
  }

  function inferStableTagFromAccessTags(accessTags) {
    if (!Array.isArray(accessTags)) return null;
    // pick first non-"all"
    return accessTags.find(t => t && t !== 'all') || null;
  }

  function initController() {
    // Attempt to find the site viewer.
    const siteViewer = document.querySelector('nested-site-viewer');
    if (!siteViewer) return;

    // Keep role simulation
    const params = getParams();
    const roleParam = params.get('role');
    if (roleParam) {
      const roles = roleParam.split(',').map(r => r.trim()).filter(Boolean);
      siteViewer.setAccessTags(roles);
    }

    // Run deep link once component is ready
    siteViewer.addEventListener('componentReady', () => {
      console.log('[Controller] Component Ready. Executing deep link logic.');
      deepLinkToTile(siteViewer);
    });

    // Update URL when user clicks tiles
    siteViewer.addEventListener('tileClicked', (event) => {
      const tile = event?.detail?.tile;
      const stableTag = inferStableTagFromAccessTags(tile?.accessTags);

      if (stableTag && TILE_BY_TAG[stableTag]) {
        setUrlParam('tag', stableTag);
      }
    });

    // Fallback if componentReady already fired
    setTimeout(() => {
      if (typeof siteViewer.navigateToTile === 'function') {
      	console.log('[Controller] Fallback check: Navigating to deep link.');
        deepLinkToTile(siteViewer);
      }
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initController);
  } else {
    initController();
  }
})();
`;
