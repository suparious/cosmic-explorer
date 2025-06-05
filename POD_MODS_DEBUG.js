// Debug helper for Pod Mods button visibility
// Run this in the browser console to check the current state

function debugPodMods() {
    if (!window.gameEngine || !window.gameEngine.gameState) {
        console.log("❌ Game engine not found or no game state");
        return;
    }
    
    const state = window.gameEngine.gameState;
    const stats = state.player_stats;
    
    console.log("🔍 Pod Mods Debug Info:");
    console.log("======================");
    console.log("✅ Has Pod:", stats.has_flight_pod);
    console.log("📍 At Repair Location:", state.at_repair_location);
    console.log("🚀 In Pod Mode:", stats.in_pod_mode);
    console.log("🆕 Just Bought Pod:", stats.just_bought_pod || false);
    console.log("💰 Current Wealth:", stats.wealth);
    console.log("🔧 Pod Augmentations:", stats.pod_augmentations || []);
    
    console.log("\n📋 Button Visibility Logic:");
    console.log("Should show button:", stats.has_flight_pod && state.at_repair_location && !stats.in_pod_mode);
    console.log("Button disabled:", stats.just_bought_pod || false);
    
    // Check if button exists
    const podModsBtn = document.getElementById('pod-mods-btn');
    console.log("\n🔘 Button Status:");
    console.log("Button exists:", !!podModsBtn);
    if (podModsBtn) {
        console.log("Button display:", podModsBtn.style.display);
        console.log("Button disabled:", podModsBtn.disabled);
        console.log("Button parent:", podModsBtn.parentElement?.id);
    }
    
    // Check action panel
    const actionPanel = document.getElementById('action-panel');
    console.log("\n📦 Action Panel:");
    console.log("Panel exists:", !!actionPanel);
    console.log("Child count:", actionPanel?.children.length);
    console.log("Children IDs:", Array.from(actionPanel?.children || []).map(c => c.id).filter(id => id));
}

// Also add a function to manually trigger the button
function forcePodModsButton() {
    if (window.uiManager) {
        window.uiManager.showPodModsButton(false);
        console.log("✅ Force showed Pod Mods button");
    } else {
        console.log("❌ UI Manager not found");
    }
}

console.log("🚀 Pod Mods debug functions loaded!");
console.log("Run debugPodMods() to check current state");
console.log("Run forcePodModsButton() to manually show the button");
