// ======================================================================
// content.js - İyileştirilmiş ve Yapılandırılmış Sürüm
// ======================================================================

// ----------------------------------------------------------------------
// 1. ANALİZ FONKSİYONLARI
// ----------------------------------------------------------------------

function analyzeEmailHeaders(headers) {
    // TODO: Bu fonksiyon, gerçek başlık (header) metnini alıp DMARC, SPF, DKIM kontrollerini yapmalıdır.
    // Şu anki hali simülasyon amaçlıdır.
    const result = {
        isFake: headers.includes("dmarc=fail"),
        warningMessage: headers.includes("dmarc=fail") ? "🔴 KRİTİK UYARI: DMARC Başarısız!" : "✅ Kontroller Başarılı.",
        realSender: "Header çekildi ve analiz edildi." 
    }; 
    return result;
}

function displayFilterResult(result, linkWarnings = []) {
    // Önceki uyarı kutusunu kaldır (eğer varsa)
    const existingWarning = document.getElementById('fake-mail-filter-warning');
    if (existingWarning) existingWarning.remove();
    
    // Yeni uyarı kutusunu oluştur
    const warningBox = document.createElement('div');
    warningBox.id = 'fake-mail-filter-warning';

    const isHighRisk = result.isFake;
    const hasHiddenLinks = linkWarnings.length > 0;

    let scoreText;
    if (isHighRisk) {
        scoreText = "DÜŞÜK GÜVENİLİRLİK";
    } else if (hasHiddenLinks) {
         scoreText = "ORTA GÜVENİLİRLİK (Gizli Linkler Var)";
    } else {
        scoreText = "YÜKSEK GÜVENİLİRLİK";
    }

    const isRisky = isHighRisk || hasHiddenLinks;

    const boxStyle = `
        position: fixed;
        top: 0;
        right: 0;
        width: 340px; /* Biraz genişletildi */
        padding: 15px;
        background-color: ${isRisky ? '#FFF0F0' : '#F0FFF0'}; /* Daha yumuşak arka plan */
        border-left: 5px solid ${isRisky ? '#CC0000' : '#00AA00'}; /* Sol tarafta renkli çizgi */
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); /* Daha belirgin gölge */
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #333;
    `;
    warningBox.style.cssText = boxStyle;

    let linkWarningsHtml = '';
    if (hasHiddenLinks) {
        linkWarningsHtml = `
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <h5 style="margin: 0 0 5px 0; color: #CC0000;">Tespit Edilen Gizli Linkler:</h5>
            <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
                ${linkWarnings.map(lw => `<li>Görünen: <strong>${lw.displayed}</strong><br>Gerçek: <strong>${lw.real}</strong></li>`).join('')}
            </ul>
        `;
    }


    const htmlContent = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"> 
            <h4 style="margin: 0; color: ${isRisky ? '#CC0000' : '#00AA00'};">
                ${isRisky ? '❌ GÜVENLİK UYARISI' : '✅ ANALİZ SONUCU'}
            </h4>
            <button id="fake-mail-filter-close" style="cursor: pointer; background: none; border: none; font-size: 16px; color: #666;">×</button>
            <span style="font-weight: bold; font-size: 14px; padding: 4px 8px; border-radius: 4px; background-color: ${isRisky ? '#CC0000' : '#00AA00'}; color: white;">
                ${scoreText}
            </span>
        </div>
        
        <p style="margin: 5px 0; font-size: 14px;">
            <strong>Kaynak Bilgisi:</strong> ${result.realSender}
        </p>
        
        <details style="margin-top: 10px; cursor: pointer;">
            <summary style="font-weight: bold; color: #444;">Detaylı Başlık ve Link Raporu</summary>
            <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px; background-color: #f9f9f9; padding: 10px; border: 1px solid #eee; max-height: 200px; overflow-y: auto;">
                ${result.warningMessage.replace(/\n/g, '<br>')}
                ${linkWarningsHtml}
            </pre>
        </details>
    `;

    warningBox.innerHTML = htmlContent; 
    document.body.prepend(warningBox);

    // Kapatma butonu olay dinleyicisi
    document.getElementById('fake-mail-filter-close').addEventListener('click', () => {
        warningBox.remove();
    });
}

function analyzeHiddenLinks(emailViewElement) {
    let linkWarnings = [];
    
    // E-posta içeriğindeki tüm linkleri bul
    const links = emailViewElement.querySelectorAll('a');

    links.forEach(link => {
        const displayedText = link.innerText.trim(); // Linkin görünen metni
        const realHref = link.href;                   // Linkin gerçek hedefi (href)

        if (!realHref || realHref.startsWith('mailto:')) {
            return; // Geçerli bir href yoksa veya sadece mail adresi ise atla
        }
        
        try {
            // URL nesneleri kullanarak domainleri kolayca çıkarabiliriz
            const displayedDomain = new URL(displayedText.includes('://') ? displayedText : `http://${displayedText}`).hostname;
            const realDomain = new URL(realHref).hostname;

            // Link metni bir URL'ye benziyorsa ve domainler uyuşmuyorsa
            if (displayedDomain && displayedDomain !== realDomain) {
                // Yaygın e-posta servisi domainlerini hariç tutabiliriz (isteğe bağlı)
                if (realDomain.endsWith('google.com') || realDomain.endsWith('outlook.com')) {
                    return; 
                }

                linkWarnings.push({
                    displayed: displayedText,
                    real: realHref,
                    warning: `⚠️ GİZLENMİŞ LİNK TESPİT EDİLDİ! Görünen Alan Adı: **${displayedDomain}**, Gerçek Alan Adı: **${realDomain}**`
                });
            }
        } catch (e) {
            // Eğer displayedText geçerli bir URL formatında değilse bu hatayı alırız, 
            // bu durumda linki normal kabul edip atlayabiliriz.
            // console.error("URL ayrıştırma hatası:", e);
        }
    });

    return linkWarnings;
}

function addLinkHoverListeners(emailViewElement) {
    const links = emailViewElement.querySelectorAll('a');

    links.forEach(link => {
        // 1. Mouse üzerine geldiğinde (mouseover) çalışacak fonksiyon
        link.addEventListener('mouseover', (event) => {
            const displayedText = link.innerText.trim();
            const realHref = link.href;
            let warningText = `Gerçek URL: ${realHref}`;

            // Gizlenmiş Link Analizi (5. Adımdan alınan mantık)
            let isHiddenLink = false;
            try {
                const displayedDomain = new URL(displayedText.includes('://') ? displayedText : `http://${displayedText}`).hostname;
                const realDomain = new URL(realHref).hostname;

                if (displayedDomain && displayedDomain !== realDomain) {
                    isHiddenLink = true;
                    warningText = `SAHTE GÖRÜNÜM UYARISI!\nGerçek Hedef: ${realHref}\nGörünen: ${displayedDomain}`;
                }
            } catch (e) {
                // Link metni URL değilse
            }

            // Araç İpucunu Oluştur ve Göster
            createCustomTooltip(event.clientX, event.clientY, warningText, isHiddenLink);
        });

        // 2. Mouse çekildiğinde (mouseout) çalışacak fonksiyon
        link.addEventListener('mouseout', () => {
            removeCustomTooltip();
        });
    });
}

function createCustomTooltip(x, y, text, isWarning) {
    // Mevcut tooltipleri temizle
    removeCustomTooltip(); 

    const tooltip = document.createElement('div');
    tooltip.id = 'fake-mail-filter-tooltip';
    tooltip.textContent = text;

    // Stil Ayarları
    tooltip.style.cssText = `
        position: fixed;
        left: ${x + 15}px; /* İmlecin biraz sağında */
        top: ${y + 15}px; /* İmlecin biraz altında */
        padding: 8px 12px;
        background-color: ${isWarning ? '#CC0000' : '#00AA00'}; /* Kırmızı veya Yeşil */
        color: white;
        border-radius: 4px;
        font-size: 13px;
        font-family: Arial, sans-serif;
        z-index: 10001; /* Uyarı kutusundan bile üstte olsun */
        pointer-events: none; /* Mouse olaylarını engellemesin */
        white-space: pre-wrap;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(tooltip);
}

function removeCustomTooltip() {
    const existingTooltip = document.getElementById('fake-mail-filter-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

// ----------------------------------------------------------------------
// 2. ANA İŞLEM VE DOM YÖNETİMİ
// ----------------------------------------------------------------------

/**
 * E-posta başlıklarını (headers) getirmek için "Orijinali Göster" linkini bulur ve
 * bu link üzerinden başlık verisini çeker.
 * @returns {Promise<string>} E-posta başlık metnini döndürür.
 */
async function fetchEmailHeaders(emailViewElement) {
    // TODO: Bu bölüm, uzantının en kritik ve en zorlu kısmıdır.
    // Gmail'in DOM yapısı karmaşık ve değişkendir.
    // 1. "Diğer" (üç nokta) menü butonunu bul.
    // 2. Bu butona tıkla.
    // 3. Açılan menüden "Orijinali göster" seçeneğini bul.
    // 4. Bu seçeneğin linkini al (genellikle yeni bir sekmede açılır).
    // 5. Bu linke bir fetch isteği göndererek ham e-posta içeriğini al.
    // 6. İçerikten sadece başlık kısmını ayıkla.

    // Bu adımlar karmaşık olduğu için şimdilik simüle edilmiş bir veri döndürüyoruz.
    console.warn("fetchEmailHeaders fonksiyonu henüz tam olarak geliştirilmedi. Simüle edilmiş veri kullanılıyor.");
    const fakeHeadersExample = `
        Delivered-To: user@gmail.com
        Received: by 2002:a05:620a:10c9:0:0:0:0 with SMTP id...
        Authentication-Results: mx.google.com;
            dkim=pass header.i=@github.com header.s=...
            spf=pass (google.com: domain of ... designates ... as permitted sender) smtp.mailfrom=...
            dmarc=fail (p=REJECT sp=REJECT dis=QUARANTINE) header.from=example.com
    `;
    return Promise.resolve(fakeHeadersExample);
}

async function processEmailView(emailViewElement) {
    // İYİLEŞTİRME: Bu öğenin daha önce işlenip işlenmediğini kontrol et.
    if (emailViewElement.dataset.fakemailProcessed === 'true') {
        return; // Zaten işlenmiş, tekrar çalışma.
    }
    // Öğeyi işlendi olarak işaretle.
    emailViewElement.dataset.fakemailProcessed = 'true';
    console.log("FakeMailFilter: Yeni bir e-posta görünümü işleniyor.", emailViewElement);

    try {
        // --- 1. Başlık Analizi ---
        const headersText = await fetchEmailHeaders(emailViewElement);
        const headerAnalysis = analyzeEmailHeaders(headersText);

        // --- 2. Link Analizi ---
        const linkWarnings = analyzeHiddenLinks(emailViewElement);

        // --- 3. GeoIP Analizi (Gelecek özellik) ---
        // const ipAddressFromHeaders = "185.120.108.10"; // Başlıktan IP ayıklanmalı
        // const geoIpData = await getGeoIpInfo(ipAddressFromHeaders);

        // Sonucu kullanıcı arayüzünde göster
        displayFilterResult(headerAnalysis, linkWarnings);

        // Linklerin üzerine gelince bilgi veren dinleyicileri ekle
        addLinkHoverListeners(emailViewElement);

    } catch (error) {
        console.error("FakeMailFilter Kritik Hata:", error);
        displayFilterResult({
            isFake: true,
            warningMessage: `❌ HATA: Eklenti bir işlem hatası ile karşılaştı. Detay: ${error.message}`,
            realSender: "HATA OLUŞTU"
        });
    }
}

// ----------------------------------------------------------------------
// 3. SAYFA DEĞİŞİKLİKLERİNİ GÖZLEMLEME (MutationObserver)
// ----------------------------------------------------------------------

const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.addedNodes.length) {
            // Gmail'de e-posta içeriğini tutan yaygın bir class. Bu selector değişebilir.
            // Daha sağlam bir selector bulmak için arayüzü incelemek gerekebilir.
            const emailView = document.querySelector('.a3s.aiL'); // .y6 yerine daha spesifik bir selector
            if (emailView && emailView.dataset.fakemailProcessed !== 'true') {
                processEmailView(emailView); 
                // Birden fazla mutasyonda aynı işlemi yapmamak için döngüden çıkabiliriz.
                break;
            }
        }
    }
});

// Gözlemleyiciyi tüm belge üzerinde değişiklikleri dinlemesi için başlat
observer.observe(document.body, { childList: true, subtree: true });