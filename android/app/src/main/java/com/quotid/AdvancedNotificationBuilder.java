package com.quotid;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.widget.RemoteViews;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Constructeur pour des notifications avancées personnalisées.
 */
public class AdvancedNotificationBuilder {
    private static final String TAG = "AdvancedNotification";
    private static final String CHANNEL_ID = "checklist-notifications";
    
    /**
     * Crée une notification stylisée avec une liste de tâches interactive.
     */
    public static void showChecklistNotification(Context context, String title, String subtitle, List<String> itemsText, int notificationId) {
        // Si pas d'ID de notification fourni, en générer un
        if (notificationId <= 0) {
            notificationId = (int) System.currentTimeMillis();
        }
        
        // Générer un ID unique pour cette liste
        String checklistId = "checklist_" + notificationId;
        
        // Préparer les données de la liste
        List<ChecklistDataManager.ChecklistItem> items = new ArrayList<>();
        for (int i = 0; i < itemsText.size(); i++) {
            String itemId = "item_" + i;
            String text = itemsText.get(i);
            items.add(new ChecklistDataManager.ChecklistItem(itemId, text, false));
        }
        
        // Sauvegarder la liste
        ChecklistDataManager.getInstance(context).saveChecklist(checklistId, items);
        
        // Créer et afficher la notification
        updateChecklistNotification(context, notificationId, checklistId, title, subtitle);
    }
    
    /**
     * Met à jour une notification de liste de tâches existante.
     */
    public static void updateChecklistNotification(Context context, int notificationId, String checklistId) {
        // Charger la liste
        List<ChecklistDataManager.ChecklistItem> items = ChecklistDataManager.getInstance(context).loadChecklist(checklistId);
        
        // Si la liste est vide, supprimer la notification
        if (items.isEmpty()) {
            NotificationManagerCompat.from(context).cancel(notificationId);
            return;
        }
        
        // Mettre à jour la notification avec le titre et sous-titre par défaut
        updateChecklistNotification(context, notificationId, checklistId, "Liste de tâches", "Appuyez pour modifier");
    }
    
    /**
     * Met à jour une notification de liste de tâches avec un titre et sous-titre spécifiés.
     */
    public static void updateChecklistNotification(Context context, int notificationId, String checklistId, String title, String subtitle) {
        // Charger la liste
        List<ChecklistDataManager.ChecklistItem> items = ChecklistDataManager.getInstance(context).loadChecklist(checklistId);
        
        // Si la liste est vide, supprimer la notification
        if (items.isEmpty()) {
            NotificationManagerCompat.from(context).cancel(notificationId);
            return;
        }
        
        try {
            // Créer des vues personnalisées pour la notification
            RemoteViews collapsedView = new RemoteViews(context.getPackageName(), R.layout.notification_checklist_layout);
            
            // Définir le titre et le sous-titre
            collapsedView.setTextViewText(R.id.notification_title, title);
            collapsedView.setTextViewText(R.id.notification_subtitle, subtitle);
            
            // Définir l'icône
            collapsedView.setImageViewResource(R.id.notification_icon, android.R.drawable.ic_menu_agenda);
            
            // Container pour les éléments
            int containerId = context.getResources().getIdentifier("checklist_container", "id", context.getPackageName());
            
            // Supprimer tous les éléments existants
            collapsedView.removeAllViews(containerId);
            
            // Ajouter des éléments à la vue
            for (ChecklistDataManager.ChecklistItem item : items) {
                RemoteViews itemView = new RemoteViews(context.getPackageName(), R.layout.notification_checklist_item);
                
                // Définir le texte et l'état coché
                itemView.setTextViewText(R.id.item_text, item.getText());
                // Correction: utiliser setBoolean au lieu de setChecked
                itemView.setBoolean(R.id.item_checkbox, "setChecked", item.isChecked());
                
                // Définir l'action pour le clic sur la case à cocher
                Intent toggleIntent = new Intent(context, NotificationActionReceiver.class);
                toggleIntent.setAction(NotificationActionReceiver.ACTION_TOGGLE_ITEM);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_CHECKLIST_ID, checklistId);
                toggleIntent.putExtra(NotificationActionReceiver.EXTRA_ITEM_ID, item.getId());
                
                PendingIntent togglePendingIntent = PendingIntent.getBroadcast(
                        context,
                        UUID.randomUUID().hashCode(), // ID unique pour éviter les conflits
                        toggleIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                
                itemView.setOnClickPendingIntent(R.id.item_checkbox, togglePendingIntent);
                itemView.setOnClickPendingIntent(R.id.item_text, togglePendingIntent);
                
                // Ajouter la vue de l'élément au container
                collapsedView.addView(containerId, itemView);
            }
            
            // Définir les actions pour les boutons Tout cocher et Tout décocher
            Intent completeAllIntent = new Intent(context, NotificationActionReceiver.class);
            completeAllIntent.setAction(NotificationActionReceiver.ACTION_COMPLETE_ALL);
            completeAllIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId);
            completeAllIntent.putExtra(NotificationActionReceiver.EXTRA_CHECKLIST_ID, checklistId);
            
            PendingIntent completeAllPendingIntent = PendingIntent.getBroadcast(
                    context,
                    UUID.randomUUID().hashCode(),
                    completeAllIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            Intent clearAllIntent = new Intent(context, NotificationActionReceiver.class);
            clearAllIntent.setAction(NotificationActionReceiver.ACTION_CLEAR_ALL);
            clearAllIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId);
            clearAllIntent.putExtra(NotificationActionReceiver.EXTRA_CHECKLIST_ID, checklistId);
            
            PendingIntent clearAllPendingIntent = PendingIntent.getBroadcast(
                    context,
                    UUID.randomUUID().hashCode(),
                    clearAllIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Ajouter les actions aux boutons
            collapsedView.setOnClickPendingIntent(R.id.btn_complete_all, completeAllPendingIntent);
            collapsedView.setOnClickPendingIntent(R.id.btn_clear_all, clearAllPendingIntent);
            
            // Intent pour fermer la notification
            Intent closeIntent = new Intent(context, NotificationActionReceiver.class);
            closeIntent.setAction(NotificationActionReceiver.ACTION_CLOSE_NOTIFICATION);
            closeIntent.putExtra(NotificationActionReceiver.EXTRA_NOTIFICATION_ID, notificationId);
            closeIntent.putExtra(NotificationActionReceiver.EXTRA_CHECKLIST_ID, checklistId);
            
            PendingIntent closePendingIntent = PendingIntent.getBroadcast(
                    context,
                    UUID.randomUUID().hashCode(),
                    closeIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Créer la notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_menu_agenda)
                    .setContent(collapsedView)
                    .setCustomContentView(collapsedView)
                    .setCustomBigContentView(collapsedView)
                    .setStyle(new NotificationCompat.DecoratedCustomViewStyle())
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_REMINDER)
                    .setOngoing(true)  // Ne pas permettre de balayer pour fermer
                    .setAutoCancel(false)
                    .setDeleteIntent(closePendingIntent);
            
            // Afficher la notification
            Notification notification = builder.build();
            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
            notificationManager.notify(notificationId, notification);
            
            Log.d(TAG, "Notification de liste mise à jour: id=" + notificationId + ", checklistId=" + checklistId);
        } catch (Exception e) {
            Log.e(TAG, "Erreur lors de la création de la notification: " + e.getMessage(), e);
        }
    }
}