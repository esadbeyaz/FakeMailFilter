# 🛡️ FakeMailFilter: Açık Kaynak Sahte E-posta Filtresi

 

FakeMailFilter, oltalama (phishing) ve sahte gönderici (spoofing) e-postalarını anında tespit etmek için tasarlanmış, tarayıcı tabanlı ücretsiz ve açık kaynaklı bir eklentidir. E-posta servisinizin web arayüzünde çalışarak, gizlenmiş gerçek kaynak bilgisini ve tehlikeli bağlantıları anında açığa çıkarır.

## 💡 Temel Özellikler

* **DMARC/SPF/DKIM Analizi:** E-posta başlıklarını kontrol ederek gönderici kimlik doğrulama sonuçlarını gösterir.
* **Gizlenmiş Link Tespiti:** Görünen link metni ile gerçek hedef adresi uyuşmayan oltalama bağlantılarını kırmızı renkle işaretler.
* **Coğrafi Konum (GeoIP):** E-postanın gönderildiği sunucunun kaynak IP adresini coğrafi olarak haritada gösterir (API kullanımı gereklidir).
* **Anlık Uyarı Kutusu:** Potansiyel tehditleri, e-posta içeriğinin hemen yanında, yüksek görünürlüğe sahip bir uyarı kutusu ile bildirir.

## 🚀 Kurulum (Geliştirici Modu)

Bu eklentiyi Chrome, Edge veya Firefox'ta çalıştırmak için aşağıdaki adımları izleyin:

1.  Bu depoyu (repository) bilgisayarınıza klonlayın veya zip olarak indirin.
2.  Tarayıcınızda `chrome://extensions` (veya `edge://extensions`) adresine gidin.
3.  Sağ üst köşedeki **Geliştirici modu**nu (Developer Mode) etkinleştirin.
4.  **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın ve indirdiğiniz/klonladığınız **FakeMailFilter** klasörünü seçin.
5.  Eklenti tarayıcınıza yüklenmiştir. Artık Gmail gibi desteklenen e-posta servislerinde çalışmaya başlayacaktır.

## ⚙️ Nasıl Çalışır?

Eklenti, e-posta açıldığında sayfa içindeki (DOM) değişiklikleri dinler. Başlıkları çekmek için [**Manifest.json**] dosyasında belirtilen izinlerle harici API çağrıları (GeoIP için) ve iç başlık okumaları yapar.


## 📄 Lisans

Bu proje MIT Lisansı altında yayınlanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakınız.
