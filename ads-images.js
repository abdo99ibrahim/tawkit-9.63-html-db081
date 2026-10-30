let JS_IMAGE_ADS = "";
let db;

// Initialize IndexedDB
const request = indexedDB.open("TawkitAdsDB", 1);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images");
    }
};
request.onsuccess = (e) => {
    db = e.target.result;
    cleanOrphanedImages(); // Run garbage collection on load
    renderAdsList();
};

// Load from LocalStorage if exists
let storedAds = localStorage.getItem('STORAGE_IMAGE_ADS');
if (storedAds) {
    JS_IMAGE_ADS = storedAds;
}

let JS_IMAGE_ADS_DATA = JS_IMAGE_ADS.split("°°").filter(ad => ad.trim() !== "");

function showImageAdsModal() {
    let modal = document.getElementById('modalImageAds');
    if (!modal) {
        createImageAdsModal();
        modal = document.getElementById('modalImageAds');
    }
    renderAdsList();
    modal.style.visibility = 'visible';
}

function createImageAdsModal() {
    let html = `
    <div id='modalImageAds' class='v9343563'>
        <div class='v9493663'>
            <div class='v9493763'></div>
            <div class='v9493863'>
                <span onclick="v9424463('adsManagerContent', 0);">&#9650;</span> &nbsp; 
                <span onclick="v9424463('adsManagerContent', 1);">&#9660;</span> &nbsp;&nbsp;&nbsp; 
                <span onclick="v9424963(this.parentNode);">&#10006;</span>
            </div>
        </div>
        <div id='adsManagerContent' class='v9467063' style='padding: 25px; overflow-y: auto; max-height: 150vh; font-family: "Amiri", serif;'>
            <div style='margin-bottom: 30px; border: 1px solid #3d3d3d; padding: 20px; border-radius: 12px; background: linear-gradient(145deg, #1a1a1a, #222); box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>
                <h3 style='color: #DFCDB1; margin-top: 0; border-bottom: 1px solid #333; padding-bottom: 10px;'>${JS_eLang.cx_ImageAds_Add || 'إضافة إعلان جديد'}</h3>
                
                <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 20px;'>
                    <div style='grid-column: span 2;'>
                        <label style='color: #888; font-size: 0.9em; margin-bottom: 8px; display: block;'>${JS_eLang.cx_ImageAds_Prayers}</label>
                        <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #333;'>
                            <label style='cursor:pointer;'><input type='checkbox' class='adPrayerCheck' id='adCheckAll' value='ALL' onchange='toggleAllPrayers(this)'> الكل</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adPrayerCheck' value='FAJR' onchange='checkIndividual()'> الفجر</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adPrayerCheck' value='DHUHR' onchange='checkIndividual()'> الظهر</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adPrayerCheck' value='ASR' onchange='checkIndividual()'> العصر</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adPrayerCheck' value='MAGHRIB' onchange='checkIndividual()'> المغرب</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adPrayerCheck' value='ISHA' onchange='checkIndividual()'> العشاء</label>
                        </div>
                    </div>

                    <div style='grid-column: span 2;'>
                        <label style='color: #888; font-size: 0.9em; margin-bottom: 8px; display: block;'>أيام الأسبوع (للتكرار)</label>
                        <div style='display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #2a2a2a; padding: 15px; border-radius: 8px; border: 1px solid #333;'>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' id='adDayCheckAll' value='ALL' onchange='toggleAllDays(this)'> طوال الأسبوع</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='6' onchange='checkIndividualDay()'> السبت</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='0' onchange='checkIndividualDay()'> الأحد</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='1' onchange='checkIndividualDay()'> الإثنين</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='2' onchange='checkIndividualDay()'> الثلاثاء</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='3' onchange='checkIndividualDay()'> الأربعاء</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='4' onchange='checkIndividualDay()'> الخميس</label>
                            <label style='cursor:pointer;'><input type='checkbox' class='adDayCheck' value='5' onchange='checkIndividualDay()'> الجمعة</label>
                        </div>
                    </div>

                    <div>
                        <label style='color: #888; font-size: 0.9em; margin-bottom: 8px; display: block;'>${JS_eLang.cx_ImageAds_DateStart}</label>
                        <input type='date' id='adDateStart' onchange='document.getElementById("adDateEnd").min=this.value' style='width:100%; padding: 10px; background: #2a2a2a; color: white; border: 1px solid #333; border-radius: 6px; box-sizing: border-box;'>
                    </div>
                    <div>
                        <label style='color: #888; font-size: 0.9em; margin-bottom: 8px; display: block;'>${JS_eLang.cx_ImageAds_DateEnd}</label>
                        <input type='date' id='adDateEnd' style='width:100%; padding: 10px; background: #2a2a2a; color: white; border: 1px solid #333; border-radius: 6px; box-sizing: border-box;'>
                    </div>

                    <div>
                        <label style='color: #888; font-size: 0.9em; margin-bottom: 8px; display: block;'>${JS_eLang.cx_ImageAds_Duration}</label>
                        <input type='number' id='adDuration' value='5' style='width:100%; padding: 10px; background: #2a2a2a; color: white; border: 1px solid #333; border-radius: 6px; box-sizing: border-box;'>
                    </div>

                    <div style='grid-column: span 2;'>
                        <label style='color: #888; font-size: 0.9em; margin-bottom: 8px; display: block;'>الصورة والمعاينة</label>
                        <div style='display: flex; align-items: center; gap: 15px; background: #2a2a2a; padding: 10px; border-radius: 8px; border: 1px solid #333;'>
                            <div style='position: relative; overflow: hidden; display: inline-block; flex: 1;'>
                                <button style='width: 100%; padding: 10px; background: #3d3d3d; border: 1px solid #555; color: white; border-radius: 6px; cursor: pointer;'>📁 اختر صورة الإعلان</button>
                                <input type='file' id='adFile' accept='image/*' onchange='handleAdFileUpload(this)' style='position: absolute; left: 0; top: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;'>
                            </div>
                            <div id='adImgPreview' style='width: 60px; height: 60px; background: #111; border: 1px solid #444; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;'>
                                <span style='color: #444; font-size: 10px;'>لا يوجد</span>
                            </div>
                        </div>
                        <input type='hidden' id='adImageKey'>
                    </div>
                </div>

                <div style='text-align: center; margin-top: 25px;'>
                    <button onclick='saveNewAd()' style='padding: 12px 40px; cursor: pointer; background: #DFCDB1; color: #111; border: none; border-radius: 30px; font-weight: bold; font-size: 1.1em; transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.3);'>حفظ الإعلان ونشره</button>
                </div>
            </div>

            <h3 style='color: #DFCDB1; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 40px;'>الإعلانات الحالية</h3>
            <div id='adsListContainer' style='background: #1a1a1a; border-radius: 12px; border: 1px solid #333; overflow: hidden;'></div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
}

function handleAdFileUpload(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            const oldKey = document.getElementById('adImageKey').value;
            // If there is an unsaved key in the form, delete it from IndexedDB to prevent orphaned files
            if (oldKey && oldKey.startsWith("img_")) {
                let isUsed = JS_IMAGE_ADS_DATA.some(ad => ad.split("|")[5] === oldKey);
                if (!isUsed) {
                    try {
                        const txDel = db.transaction("images", "readwrite");
                        txDel.objectStore("images").delete(oldKey);
                    } catch(err) {
                        console.error("Failed to delete unused temp image:", err);
                    }
                }
            }

            const key = "img_" + Date.now();
            const tx = db.transaction("images", "readwrite");
            tx.objectStore("images").put(e.target.result, key);
            tx.oncomplete = () => {
                document.getElementById('adImageKey').value = key;
                document.getElementById('adImgPreview').innerHTML = `<img src="${e.target.result}" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">`;
            };
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function toggleAllPrayers(allCb) {
    document.querySelectorAll('.adPrayerCheck').forEach(cb => {
        cb.checked = allCb.checked;
    });
}

function checkIndividual() {
    let allCheck = document.getElementById('adCheckAll');
    let others = Array.from(document.querySelectorAll('.adPrayerCheck')).filter(cb => cb.value !== 'ALL');
    let allChecked = others.every(cb => cb.checked);
    let someUnchecked = others.some(cb => !cb.checked);
    
    if (someUnchecked) allCheck.checked = false;
    if (allChecked) allCheck.checked = true;
}

function toggleAllDays(allCb) {
    document.querySelectorAll('.adDayCheck').forEach(cb => {
        cb.checked = allCb.checked;
    });
}

function checkIndividualDay() {
    let allCheck = document.getElementById('adDayCheckAll');
    let others = Array.from(document.querySelectorAll('.adDayCheck')).filter(cb => cb.value !== 'ALL');
    let allChecked = others.every(cb => cb.checked);
    let someUnchecked = others.some(cb => !cb.checked);
    
    if (someUnchecked) allCheck.checked = false;
    if (allChecked) allCheck.checked = true;
}

let editAdIndex = -1;

function saveNewAd() {
    let start = document.getElementById('adDateStart').value;
    let end = document.getElementById('adDateEnd').value;
    let duration = document.getElementById('adDuration').value;
    let imgKey = document.getElementById('adImageKey').value;
    
    let prayers = Array.from(document.querySelectorAll('.adPrayerCheck:checked')).map(cb => cb.value).join(",");
    let days = Array.from(document.querySelectorAll('.adDayCheck:checked')).map(cb => cb.value).join(",");
    
    if (start && end && end < start) {
        alert("خطأ: تاريخ الانتهاء لا يمكن أن يكون قبل تاريخ البدء");
        return;
    }

    if (!imgKey || !prayers || !days) {
        alert("يرجى اختيار الصورة والصلوات والأيام على الأقل");
        return;
    }

    let newAd = `1|${start || ""}|${end || ""}|${prayers}|${duration}|${imgKey}|${days}`;
    
    if (editAdIndex !== -1) {
        JS_IMAGE_ADS_DATA[editAdIndex] = newAd;
        editAdIndex = -1;
    } else {
        JS_IMAGE_ADS_DATA.push(newAd);
    }
    
    updateStorage();
    renderAdsList();
    
    // Clear fields
    document.getElementById('adDateStart').value = "";
    document.getElementById('adDateEnd').value = "";
    if (document.getElementById('adDateEnd').min) {
        document.getElementById('adDateEnd').removeAttribute('min');
    }
    document.getElementById('adImageKey').value = "";
    document.getElementById('adImgPreview').innerHTML = "<span style='color: #444; font-size: 10px;'>لا يوجد</span>";
    document.getElementById('adFile').value = "";
    document.querySelectorAll('.adPrayerCheck').forEach(cb => cb.checked = false);
    document.querySelectorAll('.adDayCheck').forEach(cb => cb.checked = false);

    // Restore save button state
    let submitBtn = document.querySelector("button[onclick='saveNewAd()']");
    if (submitBtn) {
        submitBtn.innerText = "حفظ الإعلان ونشره";
    }
    let cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.remove();
}

async function editAd(index) {
    editAdIndex = index;
    let ad = JS_IMAGE_ADS_DATA[index];
    let parts = ad.split("|");
    
    document.getElementById('adDateStart').value = parts[1] || "";
    document.getElementById('adDateEnd').value = parts[2] || "";
    if (parts[1]) {
        document.getElementById('adDateEnd').min = parts[1];
    }
    document.getElementById('adDuration').value = parts[4] || "15";
    document.getElementById('adImageKey').value = parts[5];
    
    const imgData = await getImageFromDB(parts[5]);
    if (imgData) {
        document.getElementById('adImgPreview').innerHTML = `<img src="${imgData}" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">`;
    } else {
        document.getElementById('adImgPreview').innerHTML = "<span style='color: #444; font-size: 10px;'>لا يوجد</span>";
    }
    
    let prayers = parts[3].split(",");
    document.querySelectorAll('.adPrayerCheck').forEach(cb => {
        cb.checked = prayers.includes(cb.value);
    });
    
    let allCheck = document.getElementById('adCheckAll');
    if (allCheck) {
        let others = Array.from(document.querySelectorAll('.adPrayerCheck')).filter(cb => cb.value !== 'ALL');
        let allChecked = others.every(cb => cb.checked);
        allCheck.checked = allChecked || prayers.includes("ALL");
    }

    let daysRaw = parts[6] || "ALL";
    let days = daysRaw.split(",");
    document.querySelectorAll('.adDayCheck').forEach(cb => {
        cb.checked = days.includes(cb.value);
    });
    
    let allDayCheck = document.getElementById('adDayCheckAll');
    if (allDayCheck) {
        let others = Array.from(document.querySelectorAll('.adDayCheck')).filter(cb => cb.value !== 'ALL');
        let allChecked = others.every(cb => cb.checked);
        allDayCheck.checked = allChecked || days.includes("ALL");
    }
    
    let submitBtn = document.querySelector("button[onclick='saveNewAd()']");
    if (submitBtn) {
        submitBtn.innerText = "تحديث الإعلان ونشره";
    }
    
    let cancelBtn = document.getElementById('cancelEditBtn');
    if (!cancelBtn && submitBtn) {
        let cancelHtml = `<button id='cancelEditBtn' onclick='cancelAdEdit()' style='padding: 12px 25px; cursor: pointer; background: #666; color: white; border: none; border-radius: 30px; font-weight: bold; font-size: 1.1em; transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.3); margin-right: 10px;'>إلغاء التعديل</button>`;
        submitBtn.parentNode.insertAdjacentHTML('beforeend', cancelHtml);
    }
    
    // Scroll smoothly to form
    document.getElementById('adDateStart').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cancelAdEdit() {
    editAdIndex = -1;
    document.getElementById('adDateStart').value = "";
    document.getElementById('adDateEnd').value = "";
    if (document.getElementById('adDateEnd').min) {
        document.getElementById('adDateEnd').removeAttribute('min');
    }
    document.getElementById('adDuration').value = "15";
    document.getElementById('adImageKey').value = "";
    document.getElementById('adImgPreview').innerHTML = "<span style='color: #444; font-size: 10px;'>لا يوجد</span>";
    document.getElementById('adFile').value = "";
    document.querySelectorAll('.adPrayerCheck').forEach(cb => cb.checked = false);
    document.querySelectorAll('.adDayCheck').forEach(cb => cb.checked = false);
    
    let submitBtn = document.querySelector("button[onclick='saveNewAd()']");
    if (submitBtn) {
        submitBtn.innerText = "حفظ الإعلان ونشره";
    }
    let cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.remove();
}

async function renderAdsList() {
    let container = document.getElementById('adsListContainer');
    if (!container || !db) return;
    
    if (JS_IMAGE_ADS_DATA.length === 0) {
        container.innerHTML = `
        <div style='text-align: center; padding: 40px 20px; color: #888; font-family: "Amiri", serif;'>
            <div style='font-size: 3.5em; margin-bottom: 15px; filter: grayscale(0.5);'>📢</div>
            <p style='margin: 0; font-size: 1.2em; font-weight: bold; color: #DFCDB1;'>لا توجد إعلانات مضافة حالياً</p>
            <p style='margin: 8px 0 0 0; font-size: 0.95em; color: #777;'>قم بإضافة أول إعلان لصلواتك باستخدام النموذج أعلاه</p>
        </div>`;
        return;
    }
    
    let html = `<div style='padding: 20px; display: flex; flex-direction: column; gap: 15px; direction: rtl;'>`;
    
    for (let i = 0; i < JS_IMAGE_ADS_DATA.length; i++) {
        let ad = JS_IMAGE_ADS_DATA[i];
        let parts = ad.split("|");
        const imgData = await getImageFromDB(parts[5]);
        
        // Date display with RTL friendly formatting
        let dateStr = "";
        if (!parts[1] && !parts[2]) {
            dateStr = `<span style='background: rgba(223, 205, 177, 0.15); color: #DFCDB1; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; display: inline-flex; align-items: center; gap: 6px; font-family: "Amiri", serif;'><span style='font-size:1.1em;'>📅</span> دائماً بدون تاريخ انتهاء</span>`;
        } else {
            let startStr = parts[1] ? parts[1] : "بدون بداية";
            let endStr = parts[2] ? parts[2] : "بدون نهاية";
            dateStr = `<span style='background: rgba(255,255,255,0.05); color: #ccc; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; display: inline-flex; align-items: center; gap: 8px; direction: rtl; font-family: sans-serif;'><span style='font-size:1.1em;'>📅</span> من ${startStr} إلى ${endStr}</span>`;
        }
        
        // Prayers Display (Badge capsules)
        const prayerTranslations = {
            "ALL": "كل الصلوات",
            "FAJR": "الفجر",
            "SHURUQ": "الشروق",
            "DHUHR": "الظهر",
            "ASR": "العصر",
            "MAGHRIB": "المغرب",
            "ISHA": "العشاء"
        };
        
        let prayersRaw = parts[3].split(",");
        let prayersHtml = prayersRaw.map(p => {
            let name = prayerTranslations[p.toUpperCase()] || p;
            let isAll = p.toUpperCase() === "ALL";
            let bg = isAll ? "rgba(223, 205, 177, 0.2)" : "rgba(255, 255, 255, 0.08)";
            let color = isAll ? "#DFCDB1" : "#ddd";
            let border = isAll ? "1px solid rgba(223, 205, 177, 0.4)" : "1px solid rgba(255,255,255,0.1)";
            return `<span style='background: ${bg}; color: ${color}; border: ${border}; padding: 3px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; font-family: "Amiri", serif; white-space: nowrap;'>${name}</span>`;
        }).join(" ");
        
        // Days Display
        const dayTranslations = {
            "ALL": "طوال الأسبوع",
            "0": "الأحد",
            "1": "الإثنين",
            "2": "الثلاثاء",
            "3": "الأربعاء",
            "4": "الخميس",
            "5": "الجمعة",
            "6": "السبت"
        };
        let daysRaw = parts[6] ? parts[6].split(",") : ["ALL"];
        let daysHtml = daysRaw.map(d => {
            let name = dayTranslations[d] || d;
            let isAll = d === "ALL";
            let bg = isAll ? "rgba(223, 205, 177, 0.2)" : "rgba(255, 255, 255, 0.08)";
            let color = isAll ? "#DFCDB1" : "#ddd";
            let border = isAll ? "1px solid rgba(223, 205, 177, 0.4)" : "1px solid rgba(255,255,255,0.1)";
            return `<span style='background: ${bg}; color: ${color}; border: ${border}; padding: 3px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; font-family: "Amiri", serif; white-space: nowrap;'>${name}</span>`;
        }).join(" ");
        
        // Duration Display
        let durationStr = `<span style='background: rgba(255,255,255,0.05); color: #DFCDB1; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; display: inline-flex; align-items: center; gap: 6px; font-family: "Amiri", serif;'><span style='font-size:1.1em;'>⏱️</span> مدة العرض: ${parts[4]} دقيقة</span>`;

        html += `
        <div style='display: flex; align-items: center; justify-content: space-between; gap: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 15px 20px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.15);' onmouseover='this.style.borderColor="rgba(223, 205, 177, 0.4)"; this.style.background="rgba(255,255,255,0.04)"; this.style.transform="translateY(-2px)"' onmouseout='this.style.borderColor="rgba(255,255,255,0.06)"; this.style.background="rgba(255,255,255,0.02)"; this.style.transform="translateY(0)"'>
            
            <!-- Thumbnail Image -->
            <div style='position: relative; width: 75px; height: 75px; flex-shrink: 0;'>
                <img src="${imgData || ''}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
            </div>

            <!-- Ad Details -->
            <div style='flex-grow: 1; display: flex; flex-direction: column; gap: 10px; text-align: right;'>
                <div style='display: flex; align-items: center; gap: 10px; flex-wrap: wrap;'>
                    ${dateStr}
                    ${durationStr}
                </div>
                <div style='display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 2px;'>
                    <span style='color: #888; font-size: 0.9em; font-family: "Amiri", serif; font-weight: bold;'>الصلوات المفعلة:</span>
                    <div style='display: flex; gap: 5px; flex-wrap: wrap;'>
                        ${prayersHtml}
                    </div>
                </div>
                <div style='display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 2px;'>
                    <span style='color: #888; font-size: 0.9em; font-family: "Amiri", serif; font-weight: bold;'>الأيام:</span>
                    <div style='display: flex; gap: 5px; flex-wrap: wrap;'>
                        ${daysHtml}
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div style='display: flex; gap: 10px; align-items: center; flex-shrink: 0; direction: ltr;'>
                <button onclick='deleteAd(${i})' style='background: rgba(239, 83, 80, 0.12); color: #EF5350; border: 1px solid rgba(239, 83, 80, 0.25); width: 42px; height: 42px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;' title='حذف' onmouseover='this.style.background="rgba(239, 83, 80, 0.3)"; this.style.color="#ff6b6b"; this.style.transform="scale(1.1)"' onmouseout='this.style.background="rgba(239, 83, 80, 0.12)"; this.style.color="#EF5350"; this.style.transform="scale(1)"'>🗑️</button>
                <button onclick='editAd(${i})' style='background: rgba(223, 205, 177, 0.12); color: #DFCDB1; border: 1px solid rgba(223, 205, 177, 0.25); width: 42px; height: 42px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;' title='تعديل' onmouseover='this.style.background="rgba(223, 205, 177, 0.3)"; this.style.transform="scale(1.1)"' onmouseout='this.style.background="rgba(223, 205, 177, 0.12)"; this.style.transform="scale(1)"'>✏️</button>
                <button onclick='fetchAndShowAd("${parts[5]}", ${parts[4]})' style='background: rgba(255, 255, 255, 0.06); color: #eee; border: 1px solid rgba(255, 255, 255, 0.15); width: 42px; height: 42px; cursor: pointer; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;' title='معاينة' onmouseover='this.style.background="rgba(255, 255, 255, 0.18)"; this.style.transform="scale(1.1)"' onmouseout='this.style.background="rgba(255, 255, 255, 0.06)"; this.style.transform="scale(1)"'>👁️</button>
            </div>

        </div>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
}


function getImageFromDB(key) {
    return new Promise((resolve) => {
        if (!db) return resolve(null);
        const tx = db.transaction("images", "readonly");
        const request = tx.objectStore("images").get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
    });
}

function deleteAd(index) {
    if (confirm("Delete this ad?")) {
        const parts = JS_IMAGE_ADS_DATA[index].split("|");
        const key = parts[5];
        const tx = db.transaction("images", "readwrite");
        tx.objectStore("images").delete(key);
        
        tx.oncomplete = () => {
            JS_IMAGE_ADS_DATA.splice(index, 1);
            updateStorage();
            renderAdsList();
            cleanOrphanedImages(); // Run garbage collection to clean any leftovers
        };
    }
}

function updateStorage() {
    JS_IMAGE_ADS = JS_IMAGE_ADS_DATA.join("°°");
    localStorage.setItem('STORAGE_IMAGE_ADS', JS_IMAGE_ADS);
}

function cleanOrphanedImages() {
    if (!db) return;
    try {
        const activeKeys = JS_IMAGE_ADS_DATA.map(ad => ad.split("|")[5]).filter(k => k);
        const tx = db.transaction("images", "readwrite");
        const store = tx.objectStore("images");
        const request = store.getAllKeys();
        
        request.onsuccess = () => {
            const allKeys = request.result;
            allKeys.forEach(key => {
                if (key && key.startsWith("img_") && !activeKeys.includes(key)) {
                    store.delete(key);
                    console.log("Cleaned orphaned image from DB:", key);
                }
            });
        };
    } catch (e) {
        console.error("Failed to clean orphaned images:", e);
    }
}

// Display logic
let adQueue = [];
let adTimer = null;


function checkAndShowAd(currentPrayerName) {
    let now = new Date();
    let todayStr = now.toISOString().split('T')[0];
    
    // Find all matching ads
    let matchingAds = JS_IMAGE_ADS_DATA.filter(ad => {
        let p = ad.split("|");
        if (p[0] !== "1") return false;
        
        // Date Check: if empty, it matches. If set, check range.
        let dateMatch = true;
        if (p[1] !== "" && todayStr < p[1]) dateMatch = false;
        if (p[2] !== "" && todayStr > p[2]) dateMatch = false;
        if (!dateMatch) return false;

        // Prayer Check
        let allowedPrayers = p[3].split(",");
        if (!allowedPrayers.includes("ALL") && !allowedPrayers.includes(currentPrayerName.toUpperCase())) return false;
        
        // Day Check
        let allowedDays = p[6] ? p[6].split(",") : ["ALL"];
        let currentDay = now.getDay().toString();
        if (!allowedDays.includes("ALL") && !allowedDays.includes(currentDay)) return false;
        
        return true;
    });

    if (matchingAds.length > 0) {
        adQueue = [...matchingAds]; // Store all matching ads in order of addition (oldest first)
        playNextAdFromQueue();
        return true;
    }
    return false;
}

async function fetchAndShowAd(key, duration) {
    const imgData = await getImageFromDB(key);
    if (imgData) {
        showAdOverlay(imgData, duration);
    } else {
        closeAdOverlay();
    }
}

async function playNextAdFromQueue() {
    if (adQueue.length > 0) {
        let nextAd = adQueue.shift();
        let p = nextAd.split("|");
        const imgData = await getImageFromDB(p[5]);
        if (imgData) {
            showAdOverlay(imgData, parseInt(p[4]));
        } else {
            playNextAdFromQueue(); // Skip to the next ad if image fetching failed
        }
    } else {
        closeAdOverlay();
    }
}

function showAdOverlay(imgSrc, durationMin) {
    let overlay = document.getElementById('adDisplayOverlay');
    if (!overlay) {
        let html = `
        <div id='adDisplayOverlay' onclick='playNextAdFromQueue()' class='v9491863' style='position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #121212; z-index: 999999; display: flex; align-items: center; justify-content: center; overflow: hidden; box-sizing: border-box; cursor: pointer;'>
            <!-- Full Screen Borderless Image (Stretched to 100% width and height like Azkar) -->
            <div style='position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1; display: flex; align-items: center; justify-content: center; pointer-events: none;'>
                <img id='adDisplayImg' src="${imgSrc}" style='width: 100%; height: 100%; object-fit: fill; display: block; transition: opacity 0.4s ease-in-out; opacity: 0;'>
            </div>

            <!-- Native Clock at Top Right (Exact Azkar Style v9492663) -->
            <div id='adDisplayClock' class='v9465963' style='position: absolute; right: 0.4%; top: 0.5%; width: 28%; font-size: 6rem; text-align: center; background: rgba(0, 0, 0, 0.82); border-radius: 10%; box-shadow: 0 0 1.5vw rgba(0, 0, 0, 0.3); line-height: 1.0em; font-family: var(--fnDIGITS), sans-serif; letter-spacing: 0.085em; color: var(--esSALATS); z-index: 2; pointer-events: none;'></div>

            <!-- Countdown Timer at Bottom Left (Compact Circular Badge) -->
            <div id='adDisplayTimerContainer' style='position: absolute; left: 50%; bottom: 0.5%; z-index: 2; display: flex; align-items: center; gap: 10px; color: #DFCDB1; font-family: var(--fnDIGITS), "Amiri", sans-serif; font-size: 2.6vw; text-shadow: 2px 2px 4px black; background: rgba(0, 0, 0, 0.55); padding: 8px 18px 8px 14px; border-radius: 30px; font-weight: bold; pointer-events: none; direction: ltr; white-space: nowrap; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);'>
                <span style='font-size: 1em; line-height: 1;'>⏱</span>
                <span id='adDisplayTimer' style='font-family: var(--fnDIGITS), sans-serif; letter-spacing: 0.05em;'></span>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        overlay = document.getElementById('adDisplayOverlay');
    } else {
        let img = document.getElementById('adDisplayImg');
        if (img) {
            img.style.opacity = '0'; // Smooth fade out
            setTimeout(() => {
                img.src = imgSrc;
                img.onload = () => {
                    img.style.opacity = '1'; // Smooth fade in once loaded
                };
            }, 400);
        }
    }

    overlay.onclick = playNextAdFromQueue; // Sync overlay click to advance queue
    overlay.className = "v9491863"; // Reset transition class to hidden
    overlay.style.display = 'flex';
    
    // Check if Azkar picture semi-transparent setting is enabled in the app
    setTimeout(() => {
        if (typeof JS_10minAzkarSemiTransparent !== 'undefined' && JS_10minAzkarSemiTransparent === 1) {
            overlay.className = "v9486963"; // Opacity 0.93
        } else {
            overlay.className = "v9500163"; // Opacity 1.00
        }
        // Fade in the image smoothly
        let img = document.getElementById('adDisplayImg');
        if (img) img.style.opacity = '1';
    }, 50);

    let secondsLeft = durationMin * 60;
    
    if (adTimer) clearInterval(adTimer);
    
    function updateDisplay() {
        // Sync clock with the application's blinking time using global variable v9431863_blink
        let timeStr = "";
        if (typeof v9431863_blink !== 'undefined' && v9431863_blink) {
            timeStr = v9431863_blink;
        } else {
            let now = new Date();
            let h = now.getHours();
            let m = now.getMinutes();
            if (typeof JS_DATA !== 'undefined' && JS_DATA.ucActivate24Hours !== 1) {
                h = h % 12 || 12;
            }
            timeStr = `${h}<span class="blink-colon">:</span>${m < 10 ? '0' : ''}${m}`;
        }
        document.getElementById('adDisplayClock').innerHTML = timeStr;
        
        let m = Math.floor(secondsLeft / 60);
        let s = secondsLeft % 60;
        document.getElementById('adDisplayTimer').innerText = `${m}:${s < 10 ? '0' + s : s}`;
    }
    
    updateDisplay();
    adTimer = setInterval(() => {
        secondsLeft--;
        updateDisplay();
        if (secondsLeft <= 0) {
            playNextAdFromQueue();
        }
    }, 1000);
}

function closeAdOverlay() {
    let overlay = document.getElementById('adDisplayOverlay');
    if (overlay) {
        overlay.className = "v9487063"; // Smooth fade out
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2500);
    }
    if (adTimer) clearInterval(adTimer);
    if (typeof v9346263 === 'function') v9346263(); 
}

function hideAdOverlay() {
    adQueue = []; // Empty the queue to force immediate exit
    closeAdOverlay();
}


