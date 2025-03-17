package com.quotid;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.List;

/**
 * Récepteur de diffusion pour gérer les actions sur les notifications.
 * Cela permet de répondre aux interactions de l'utilisateur avec les notifications cochables.
 */
public class NotificationActionReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationAction";
    
    // Actions
    public static final String ACTION_TOGGLE_ITEM = "com.quotid.TOGGLE_ITEM";
    public static final String ACTION_COMPLETE_ALL = "com.quotid.COMPLETE_ALL";
    public static final String ACTION_CLEAR_ALL = "com.quotid.CLEAR_ALL";
    public static final String ACTION_CLOSE_NOTIFICATION = "com.quotid.CLOSE_NOTIFICATION";
    
    // Extras
    public static final String EXTRA_NOTIFICATION_ID = "notification_id";
    public static final String EXTRA_CHECKLIST_ID = "checklist_id";
    public static final String EXTRA_ITEM_ID = "item_id";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Received action: " + action);
        
        if (action == null) return;
        
        // Extraire les données communes
        int notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1);
        String checklistId = intent.getStringExtra(EXTRA_CHECKLIST_ID);
        
        if (notificationId == -1 || checklistId == null) {
            Log.e(TAG, "Données notification manquantes: id=" + notificationId + ", checklistId=" + checklistId);
            return;
        }
        
        // Gestionnaire de données
        ChecklistDataManager dataManager = ChecklistDataManager.getInstance(context);
        
        switch (action) {
            case ACTION_TOGGLE_ITEM:
                // Récupérer l'ID de l'élément
                String itemId = intent.getStringExtra(EXTRA_ITEM_ID);
                if (itemId == null) {
                    Log.e(TAG, "ID d'élément manquant");
                    return;
                }
                
                // Charger la liste et trouver l'élément
                List<ChecklistDataManager.ChecklistItem> items = dataManager.loadChecklist(checklistId);
                boolean currentState = false;
                
                for (ChecklistDataManager.ChecklistItem item : items) {
                    if (item.getId().equals(itemId)) {
                        currentState = item.isChecked();
                        break;
                    }
                }
                
                // Inverser et sauvegarder l'état
                dataManager.updateItemCheckedState(checklistId, itemId, !currentState);
                
                // Mettre à jour la notification
                updateNotification(context, notificationId, checklistId);
                break;
                
            case ACTION_COMPLETE_ALL:
                // Cocher tous les éléments
                dataManager.setAllItemsCheckedState(checklistId, true);
                
                // Mettre à jour la notification
                updateNotification(context, notificationId, checklistId);
                break;
                
            case ACTION_CLEAR_ALL:
                // Décocher tous les éléments
                dataManager.setAllItemsCheckedState(checklistId, false);
                
                // Mettre à jour la notification
                updateNotification(context, notificationId, checklistId);
                break;
                
            case ACTION_CLOSE_NOTIFICATION:
                // Fermer la notification
                NotificationManagerCompat.from(context).cancel(notificationId);
                break;
        }
    }
    
    /**
     * Met à jour la notification avec le dernier état des éléments.
     */
    private void updateNotification(Context context, int notificationId, String checklistId) {
        // Cette méthode sera implémentée dans AdvancedNotificationBuilder
        AdvancedNotificationBuilder.updateChecklistNotification(context, notificationId, checklistId);
    }
}
