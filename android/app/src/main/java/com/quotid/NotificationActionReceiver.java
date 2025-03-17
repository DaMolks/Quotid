package com.quotid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import androidx.core.app.NotificationManagerCompat;

/**
 * Récepteur de diffusion pour gérer les actions sur les notifications.
 * Cela permet de répondre aux interactions de l'utilisateur avec les notifications cochables.
 */
public class NotificationActionReceiver extends BroadcastReceiver {
    private static final String TAG = "NotificationAction";
    
    // Actions
    public static final String ACTION_TOGGLE_ITEM = "com.quotid.TOGGLE_ITEM";
    
    // Extras
    public static final String EXTRA_NOTIFICATION_ID = "notification_id";
    public static final String EXTRA_ITEM_ID = "item_id";
    public static final String EXTRA_ITEM_TEXT = "item_text";
    public static final String EXTRA_ITEM_CHECKED = "item_checked";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d(TAG, "Received action: " + action);
        
        if (ACTION_TOGGLE_ITEM.equals(action)) {
            // Extraire les données
            int notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1);
            int itemId = intent.getIntExtra(EXTRA_ITEM_ID, -1);
            String itemText = intent.getStringExtra(EXTRA_ITEM_TEXT);
            boolean wasChecked = intent.getBooleanExtra(EXTRA_ITEM_CHECKED, false);
            
            Log.d(TAG, "Toggle item " + itemId + " in notification " + notificationId + 
                  ", was checked: " + wasChecked + ", text: " + itemText);
            
            // Mettre à jour l'état de l'élément (inversion de l'état)
            boolean newCheckedState = !wasChecked;
            
            // Mettre à jour la notification
            // Dans une implémentation complète, vous stockeriez ces états dans SharedPreferences
            // et vous mettriez à jour l'interface utilisateur de l'application
            
            // Pour cet exemple, nous allons simplement créer un Intent qui sera renvoyé à l'application
            // lorsqu'elle sera à nouveau active
            Intent updateIntent = new Intent("com.quotid.ITEM_TOGGLED");
            updateIntent.putExtra(EXTRA_ITEM_ID, itemId);
            updateIntent.putExtra(EXTRA_ITEM_TEXT, itemText);
            updateIntent.putExtra(EXTRA_ITEM_CHECKED, newCheckedState);
            context.sendBroadcast(updateIntent);
            
            // Dans un cas réel, vous pourriez également mettre à jour la notification elle-même
            // Mais cela nécessiterait de conserver l'état de tous les éléments
            
            // Pour le moment, nous fermons simplement la notification
            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
            notificationManager.cancel(notificationId);
            
            // Créer une nouvelle notification avec l'état mis à jour
            // NOTE: Dans une vraie implémentation, cela nécessiterait de conserver
            // tous les éléments de la liste et leurs états
            // Pour cette démo simplifiée, nous ne réaffichons pas la notification
        }
    }
}
