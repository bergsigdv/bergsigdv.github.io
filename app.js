document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Verander hierdie na jou gepubliseerde Google Sheet CSV skakel
    // Bv: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
    // Vir nou gebruik ons 'n plaaslike toetslêer as voorbeeld.
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThqVKGADV4Iey8DygjONklcnMbZnF3CmLD56M3SV-ITpOslerVKefRKZ08LW52OURUPQzGIh3g4jAl/pub?output=csv';

    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const linksContainer = document.getElementById('links-container');

    // Haal die data met PapaParse
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            loader.style.display = 'none';

            if (results.errors.length > 0 && results.data.length === 0) {
                errorMessage.style.display = 'block';
                console.error("PapaParse Errors:", results.errors);
                return;
            }

            renderLinks(results.data);
        },
        error: function (err) {
            loader.style.display = 'none';
            errorMessage.style.display = 'block';
            console.error("Error fetching CSV:", err);
        }
    });

    function renderLinks(data) {
        // Filter out inaktiewe skakels en sorteer
        const activeLinks = data
            .filter(item => {
                // Maak seker Active is 1 (as string of nommer)
                return item.Active && item.Active.toString().trim() === '1';
            })
            .sort((a, b) => {
                const orderA = parseInt(a.Order) || 0;
                const orderB = parseInt(b.Order) || 0;
                return orderA - orderB;
            });

        if (activeLinks.length === 0) {
            linksContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Geen aktiewe skakels gevind nie.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();

        activeLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.Website;
            a.className = 'link-card';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'card-image-container';

            // Check if it's the Bergsig link to add the logo background
            if ((link.Website.toLowerCase().includes('bergsigdv.co.za') || link.Name.toLowerCase().includes('uitreik')) && !link.Name.toLowerCase().includes('vinkel') && !link.Name.toLowerCase().includes('pinkster')) {
                imageContainer.classList.add('card-image-bergsig');
            } else if (link.Name.toLowerCase().includes('vinkel')) {
                imageContainer.classList.add('card-image-vinkel');
            } else if (link.Name.toLowerCase().includes('pinkster')) {
                imageContainer.classList.add('card-image-pinksterkos');
            } else {
                // Eenvoudige ikoon as daar nie 'n prentjie is nie
                const icon = document.createElement('i');
                icon.className = 'fas fa-external-link-alt card-icon';
                imageContainer.appendChild(icon);
            }

            const contentContainer = document.createElement('div');
            contentContainer.className = 'card-content';

            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = link.Name;

            const urlHint = document.createElement('div');
            urlHint.className = 'card-url-hint';

            // Verwyder https:// ens. vir 'n skoner voorkoms
            let displayUrl = link.Website;
            try {
                const urlObj = new URL(link.Website);
                displayUrl = urlObj.hostname;
            } catch (e) {
                // Gebruik oorspronklike skakel as URL parsing faal
            }
            urlHint.textContent = displayUrl;

            contentContainer.appendChild(title);
            contentContainer.appendChild(urlHint);

            a.appendChild(imageContainer);
            a.appendChild(contentContainer);

            fragment.appendChild(a);
        });

        linksContainer.innerHTML = '';
        linksContainer.appendChild(fragment);
    }
});
