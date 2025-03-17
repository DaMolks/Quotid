package com.quotid;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.Random;

public class AdvancedNotificationModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AdvancedNotification";
    private static final String ADVANCED_CHANNEL_ID = "advanced-notifications";
    private static final String CHECKLIST_CHANNEL_ID = "checklist-notifications";
    
    private final ReactApplicationContext reactContext;
    private NotificationManager notificationManager;

    public AdvancedNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.notificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        
        // Créer les canaux de notification au démarrage du module
        createNotificationChannels();
    }

    @Override
    public String getName() {
        return "AdvancedNotification";
    }
    
    private void createNotificationChannels() {
        // Créer les canaux uniquement sur Android O et supérieur
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Canal pour les notifications avancées
            NotificationChannel advancedChannel = new NotificationChannel(
                    ADVANCED_CHANNEL_ID,
                    "Notifications Avancées",
                    NotificationManager.IMPORTANCE_HIGH
            );
            advancedChannel.setDescription("Canal pour les notifications avancées");
            advancedChannel.enableVibration(true);
            advancedChannel.enableLights(true);
            
            // Canal pour les notifications de liste cochable
            NotificationChannel checklistChannel = new NotificationChannel(
                    CHECKLIST_CHANNEL_ID,
                    "Listes Cochables",
                    NotificationManager.IMPORTANCE_HIGH
            );
            checklistChannel.setDescription("Canal pour les notifications de liste à cocher");
            checklistChannel.enableVibration(true);
            checklistChannel.enableLights(true);
            
            // Enregistrer les canaux
            notificationManager.createNotificationChannel(advancedChannel);
            notificationManager.createNotificationChannel(checklistChannel);
            
            Log.d(TAG, "Canaux de notification avancés créés");
        }
    }
    
    /**
     * Crée une notification avec une liste interactive.
     * 
     * @param title Le titre de la notification
     * @param content Le contenu de la notification
     * @param items Tableau des éléments de la liste
     * @param promise Promesse à résoudre
     */
    @ReactMethod
    public void showChecklistNotification(String title, String content, ReadableArray items, Promise promise) {
        try {
            // Générer un ID unique pour la notification
            int notificationId = new Random().nextInt(1000000);
            
            // Créer le constructeur de notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHECKLIST_CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_menu_agenda) // Icône d'agenda
                    .setContentTitle(title)
                    .setContentText(content)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .setAutoCancel(false) // Ne pas annuler automatiquement pour permettre l'interaction
                    .setOngoing(true);    // Rendre persistante pour des interactions multiples
            
            // Intent pour ouvrir l'application
            Intent appIntent = reactContext.getPackageManager().getLaunchIntentForPackage(reactContext.getPackageName());
            PendingIntent pendingAppIntent = PendingIntent.getActivity(
                    reactContext,
                    notificationId,
                    appIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            builder.setContentIntent(pendingAppIntent);
            
            // Crée un style pour la liste déroulante
            NotificationCompat.InboxStyle inboxStyle = new NotificationCompat.InboxStyle()
                    .setBigContentTitle(title)
                    .setSummaryText("Liste de tâches à cocher");
            
            // Ajouter des actions pour chaque élément de la liste
            for (int i = 0; i < items.size(); i++) {
                ReadableMap item = items.getMap(i);
                String itemText = item.getString("text");
                boolean checked = item.hasKey("checked") && item.getBoolean("checked");
                
                // Afficher dans le style InboxStyle
                String displayText = (checked ? "☑ " : "☐ ") + itemText;
                inboxStyle.addLine(displayText);
                
                // Créer une action pour cet élément
                Intent toggleIntent = new Intent(reactContext, NotificationActionReceiver.class);
                toggleIntent.setAction(NotificationActionReceiver.ACTION_TOGGLE_ITEM);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_ITEM_ID, i);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_ITEM_TEXT, itemText);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_ITEM_CHECKED, checked);
                
                // Créer un PendingIntent unique pour chaque élément
                PendingIntent togglePendingIntent = PendingIntent.getBroadcast(
                        reactContext,
                        notificationId * 100 + i, // ID unique pour chaque élément
                        toggleIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                
                // Ajouter l'action à la notification (limité à 3 actions par notification)
                if (i < 3) {
                    builder.addAction(
                            checked ? android.R.drawable.checkbox_on_background : android.R.drawable.checkbox_off_background,
                            itemText,
                            togglePendingIntent
                    );
                }
            }
            
            // Ajouter un bouton pour fermer la notification
            Intent closeIntent = new Intent(reactContext, NotificationActionReceiver.class);
            closeIntent.setAction("com.quotid.CLOSE_NOTIFICATION");
            closeIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId);
            PendingIntent closePendingIntent = PendingIntent.getBroadcast(
                    reactContext,
                    notificationId * 100 + 99, // ID unique pour l'action de fermeture
                    closeIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            builder.addAction(
                    android.R.drawable.ic_menu_close_clear_cancel,
                    "Fermer",
                    closePendingIntent
            );
            
            // Appliquer le style
            builder.setStyle(inboxStyle);
            
            // Afficher la notification
            NotificationManagerCompat notificationManagerCompat = NotificationManagerCompat.from(reactContext);
            notificationManagerCompat.notify(notificationId, builder.build());
            
            // Résoudre la promesse avec l'ID de la notification
            WritableMap result = Arguments.createMap();
            result.putInt("id", notificationId);
            promise.resolve(result);
            
            Log.d(TAG, "Notification interactive affichée, ID: " + notificationId);
        } catch (Exception e) {
            Log.e(TAG, "Erreur lors de l'affichage de la notification interactive", e);
            promise.reject("notification_error", "Erreur lors de l'affichage de la notification: " + e.getMessage(), e);
        }
    }
    
    /**
     * Annule une notification par son ID.
     * 
     * @param notificationId L'ID de la notification à annuler
     * @param promise Promesse à résoudre
     */
    @ReactMethod
    public void cancelNotification(int notificationId, Promise promise) {
        try {
            notificationManager.cancel(notificationId);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("cancel_error", "Erreur lors de l'annulation de la notification", e);
        }
    }
}
