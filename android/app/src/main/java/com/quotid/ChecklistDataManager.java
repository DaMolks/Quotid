package com.quotid;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gère les données des listes de tâches et persiste leur état.
 */
public class ChecklistDataManager {
    private static final String TAG = "ChecklistDataManager";
    private static final String PREFS_NAME = "com.quotid.checklists";
    private static final String KEY_PREFIX = "checklist_";
    
    // Instance singleton
    private static ChecklistDataManager instance;
    
    // Cache en mémoire des listes actuelles
    private Map<String, List<ChecklistItem>> checklists = new HashMap<>();
    
    // Préférences partagées pour la persistance
    private SharedPreferences preferences;
    
    /**
     * Modèle d'un élément de liste à cocher
     */
    public static class ChecklistItem {
        private String id;
        private String text;
        private boolean checked;
        
        public ChecklistItem(String id, String text, boolean checked) {
            this.id = id;
            this.text = text;
            this.checked = checked;
        }
        
        public String getId() { return id; }
        public String getText() { return text; }
        public boolean isChecked() { return checked; }
        
        public void setChecked(boolean checked) { this.checked = checked; }
        
        @Override
        public String toString() {
            return "ChecklistItem{id='" + id + "', text='" + text + "', checked=" + checked + "}";
        }
    }
    
    private ChecklistDataManager(Context context) {
        preferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }
    
    /**
     * Obtient l'instance singleton.
     */
    public static synchronized ChecklistDataManager getInstance(Context context) {
        if (instance == null) {
            instance = new ChecklistDataManager(context.getApplicationContext());
        }
        return instance;
    }
    
    /**
     * Sauvegarde une liste de tâches.
     */
    public void saveChecklist(String checklistId, List<ChecklistItem> items) {
        // Mettre à jour le cache
        checklists.put(checklistId, new ArrayList<>(items));
        
        // Sérialiser en JSON pour persistance
        try {
            JSONArray jsonArray = new JSONArray();
            for (ChecklistItem item : items) {
                JSONObject jsonItem = new JSONObject();
                jsonItem.put("id", item.getId());
                jsonItem.put("text", item.getText());
                jsonItem.put("checked", item.isChecked());
                jsonArray.put(jsonItem);
            }
            
            preferences.edit()
                    .putString(KEY_PREFIX + checklistId, jsonArray.toString())
                    .apply();
            
            Log.d(TAG, "Checklist sauvegardée: " + checklistId + " avec " + items.size() + " éléments");
        } catch (JSONException e) {
            Log.e(TAG, "Erreur lors de la sérialisation de la checklist: " + e.getMessage());
        }
    }
    
    /**
     * Charge une liste de tâches.
     */
    public List<ChecklistItem> loadChecklist(String checklistId) {
        // Vérifier le cache d'abord
        if (checklists.containsKey(checklistId)) {
            return new ArrayList<>(checklists.get(checklistId));
        }
        
        // Sinon, charger depuis les préférences
        String json = preferences.getString(KEY_PREFIX + checklistId, null);
        if (json == null) {
            return new ArrayList<>();
        }
        
        List<ChecklistItem> items = new ArrayList<>();
        try {
            JSONArray jsonArray = new JSONArray(json);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonItem = jsonArray.getJSONObject(i);
                String id = jsonItem.getString("id");
                String text = jsonItem.getString("text");
                boolean checked = jsonItem.getBoolean("checked");
                items.add(new ChecklistItem(id, text, checked));
            }
            
            // Mettre à jour le cache
            checklists.put(checklistId, new ArrayList<>(items));
            
            Log.d(TAG, "Checklist chargée: " + checklistId + " avec " + items.size() + " éléments");
        } catch (JSONException e) {
            Log.e(TAG, "Erreur lors de la désérialisation de la checklist: " + e.getMessage());
        }
        
        return items;
    }
    
    /**
     * Met à jour l'état coché d'un élément.
     */
    public void updateItemCheckedState(String checklistId, String itemId, boolean checked) {
        List<ChecklistItem> items = loadChecklist(checklistId);
        boolean updated = false;
        
        for (ChecklistItem item : items) {
            if (item.getId().equals(itemId)) {
                item.setChecked(checked);
                updated = true;
                break;
            }
        }
        
        if (updated) {
            saveChecklist(checklistId, items);
            Log.d(TAG, "État d'élément mis à jour: checklist=" + checklistId + ", item=" + itemId + ", checked=" + checked);
        }
    }
    
    /**
     * Cocher/décocher tous les éléments d'une liste.
     */
    public void setAllItemsCheckedState(String checklistId, boolean checked) {
        List<ChecklistItem> items = loadChecklist(checklistId);
        
        for (ChecklistItem item : items) {
            item.setChecked(checked);
        }
        
        saveChecklist(checklistId, items);
        Log.d(TAG, "Tous les éléments de la checklist " + checklistId + " mis à l'état checked=" + checked);
    }
    
    /**
     * Supprimer une liste.
     */
    public void deleteChecklist(String checklistId) {
        checklists.remove(checklistId);
        preferences.edit().remove(KEY_PREFIX + checklistId).apply();
        Log.d(TAG, "Checklist supprimée: " + checklistId);
    }
}
