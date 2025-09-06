async function loadMonster() {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file"); // e.g. "goblin.json"
  if (!file) return;

  // Load index.json to map file -> display name
  const index = await fetch("data/index.json").then(r => r.json());
  const entry = index.find(e => e.file === file);

  // Load monster JSON
  const monster = await fetch(`data/${file}`).then(r => r.json());

  // Use display name from index.json if available, fallback to JSON
  const displayName = entry?.name || monster.name || file.replace(".json", "");

  const container = document.getElementById("monster");

  // Helper for ability score formatting (with modifier)
  const formatAbility = (score) => {
    const mod = Math.floor((score - 10) / 2);
    const sign = mod >= 0 ? `+${mod}` : mod;
    return `${score} (${sign})`;
  };
  // Actual display psuedo CSS
  container.innerHTML = `
    <div class="creature-heading">
      <h1>${displayName}</h1>
      <h5>${monster.size || "Medium"} ${monster.type || ""}${
        monster.alignment ? `, ${monster.alignment}` : ""
      }</h5>
    </div>
    <hr class="orange-border">

    <div class="property-line">
      <h4>Armor Class&nbsp</h4><p>${monster.ac}</p>
    </div>
    <div class="property-line">
      <h4>Hit Points&nbsp</h4><p>${monster.hp}</p>
    </div>
    ${monster.speed ? `<div class="property-line"><h4>Speed&nbsp</h4><p>${monster.speed}</p></div>` : ""}
    
    <hr class="orange-border">

    <div class="abilities">
      ${Object.entries(monster.abilities || {}).map(([k,v]) => `
        <div>
          <h4>${k.toUpperCase()}</h4>
          <p>${formatAbility(v)}</p>
        </div>
      `).join("")}
    </div>

    <hr class="orange-border">

    ${monster.saves ? `<div class="property-line"><h4>Saving Throws&nbsp</h4><p>${monster.saves}</p></div>` : ""}
    ${monster.skills ? `<div class="property-line"><h4>Skills&nbsp</h4><p>${monster.skills}</p></div>` : ""}
	${monster.immunities ? `<div class="property-line"><h4>Damage Immunities&nbsp</h4><p>${monster.immunities}</p></div>` : ""}
	${monster.resistance ? `<div class="property-line"><h4>Damage Resistance&nbsp</h4><p>${monster.resistance}</p></div>` : ""}
	${monster.vulnerability ? `<div class="property-line"><h4>Damage Vulnerability&nbsp</h4><p>${monster.vulnerability}</p></div>` : ""}
	${monster.conimmunities ? `<div class="property-line"><h4>Condition Immunities&nbsp</h4><p>${monster.conimmunities}</p></div>` : ""}
	${monster.senses ? `<div class="property-line"><h4>Senses&nbsp</h4><p>${monster.senses}</p></div>` : ""}
    ${monster.languages ? `<div class="property-line"><h4>Languages&nbsp</h4><p>${monster.languages}</p></div>` : ""}
    <div class="property-line"> <h4>Challenge&nbsp</h4><p>${monster.cr}</p>
    </div>

    <hr class="orange-border">

    ${monster.traits && monster.traits.length ? `
      ${monster.traits.map(t => `
        <p><strong><em>${t.name}.</em></strong> ${t.desc}</p>
      `).join("")}
    ` : ""}

    ${monster.actions && monster.actions.length ? `
      <h3>Actions</h3>
      ${monster.actions.map(a => `
        <p><strong><em>${a.name}.</em></strong> ${a.desc}</p>
      `).join("")}
    ` : ""}
	
    ${monster.reactions && monster.reactions.length ? `
      <h3>Rections</h3>
      ${monster.reactions.map(a => `
        <p><strong><em>${a.name}.</em></strong> ${a.desc}</p>
      `).join("")}
    ` : ""}

    ${monster.legendary && monster.legendary.length ? `
      <h3>Legendary Actions</h3>
	  <p>The ${displayName} can take ${monster.legendarynumber || 3} legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The ${displayName} regains spent legendary actions at the start of its turn.</p>
      ${monster.legendary.map(a => `
        <p><strong><em>${a.name}.</em></strong> ${a.desc}</p>
      `).join("")}
    ` : ""} `;

// Add description, lair actions, and regional effects outside the stat block
if (
  monster.description ||
  monster.lairactions?.length ||
  monster.regionaleffects?.length
) {
  const outsideContainer = document.createElement("div");
  outsideContainer.style.background = "transparent"; // optional
  outsideContainer.style.border = "none";           // optional

  let outsideHTML = "";

  // Monster description
  if (monster.description) {
    outsideHTML += `<p>${monster.description.replace(/\n/g, "<br>")}</p>`;
  }

  // Lair Actions
  if (monster.lairactions?.length) {
    const lair = monster.lairactions[0];
    outsideHTML += `<h3>Lair Actions</h3>`;

    if (lair.description) {
      outsideHTML += `<p>${lair.description.replace(/\n/g, "<br>")}</p>`;
    }

    if (lair.bullets?.length) {
      outsideHTML += "<ul>";
      lair.bullets.forEach(b => {
        outsideHTML += `<li>${b}</li>`;
      });
      outsideHTML += "</ul>";
    }
  }

  // Regional Effects
  if (monster.regionaleffects?.length) {
    const regional = monster.regionaleffects[0];
    outsideHTML += `<h3>Regional Effects</h3>`;

    if (regional.description) {
      outsideHTML += `<p>${regional.description.replace(/\n/g, "<br>")}</p>`;
    }

    if (regional.bullets?.length) {
      outsideHTML += "<ul>";
      regional.bullets.forEach(b => {
        outsideHTML += `<li>${b}</li>`;
      });
      outsideHTML += "</ul>";
    }

    // Secondary description after bullet points
    if (regional.secondaryDescription) {
      outsideHTML += `<p>${regional.secondaryDescription.replace(/\n/g, "<br>")}</p>`;
    }
  }

  // Insert the container after the stat block
  outsideContainer.innerHTML = outsideHTML;
  container.insertAdjacentElement("afterend", outsideContainer);
	}
}

loadMonster();
