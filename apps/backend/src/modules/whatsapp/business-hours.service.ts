import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface BusinessHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string; // "HH:mm" format (e.g., "12:00")
  closeTime: string; // "HH:mm" format (e.g., "22:00")
}

export interface BusinessHoursConfig {
  timezone: string; // e.g., "America/Santiago"
  schedule: BusinessHours[];
  closedMessage: string;
  offlineMessage: string;
  useTemplateWhenClosed: boolean;
  templateName?: string; // WhatsApp template name for closed hours
}

@Injectable()
export class BusinessHoursService {
  private readonly logger = new Logger(BusinessHoursService.name);
  private readonly config: BusinessHoursConfig;

  constructor(private configService: ConfigService) {
    // Get company information from environment variables
    const restaurantName = this.configService.get<string>("RESTAURANT_NAME") || "ChatBotDysa";
    const restaurantPhone = this.configService.get<string>("RESTAURANT_PHONE") || "+56965419765";
    const restaurantHours = this.configService.get<string>("RESTAURANT_HOURS") || "24/7 - Soporte automatizado";
    const restaurantDescription = this.configService.get<string>("RESTAURANT_DESCRIPTION") || "Sistema de chatbot inteligente";

    this.config = {
      timezone: this.configService.get(
        "RESTAURANT_TIMEZONE",
        "America/Santiago",
      ),
      schedule: [
        // 24/7 availability for ChatBotDysa (can be customized per client)
        { dayOfWeek: 0, openTime: "00:00", closeTime: "23:59" }, // Sunday
        { dayOfWeek: 1, openTime: "00:00", closeTime: "23:59" }, // Monday
        { dayOfWeek: 2, openTime: "00:00", closeTime: "23:59" }, // Tuesday
        { dayOfWeek: 3, openTime: "00:00", closeTime: "23:59" }, // Wednesday
        { dayOfWeek: 4, openTime: "00:00", closeTime: "23:59" }, // Thursday
        { dayOfWeek: 5, openTime: "00:00", closeTime: "23:59" }, // Friday
        { dayOfWeek: 6, openTime: "00:00", closeTime: "23:59" }, // Saturday
      ],
      closedMessage: `🤖 *${restaurantName}*

¡Gracias por contactarnos! 😊

En este momento nuestro sistema está *fuera del horario de atención*.

📅 *Horario de atención:*
${restaurantHours}

Responderemos tu mensaje lo antes posible. ¡Gracias por tu paciencia!

_${restaurantDescription}_ 💬`,
      offlineMessage: `🤖 *${restaurantName}*

¡Gracias por escribirnos! 😊

Nuestro sistema de mensajería está temporalmente fuera de servicio.

📞 Para más información, contáctanos al:
${restaurantPhone}

📅 *Horario de atención:*
${restaurantHours}

¡Disculpa las molestias!`,
      useTemplateWhenClosed: this.configService.get(
        "USE_WHATSAPP_TEMPLATE_CLOSED",
        "false",
      ) === "true",
      templateName: this.configService.get(
        "WHATSAPP_CLOSED_TEMPLATE_NAME",
        "",
      ),
    };

    this.logger.log(
      `Business hours configured: ${this.config.timezone}, Template mode: ${this.config.useTemplateWhenClosed}`,
    );
  }

  /**
   * Check if the restaurant is currently open
   * @returns true if open, false if closed
   */
  isOpen(): boolean {
    try {
      const now = new Date();

      // Get current time in restaurant's timezone
      const localTime = new Intl.DateTimeFormat("en-US", {
        timeZone: this.config.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      const localDay = new Intl.DateTimeFormat("en-US", {
        timeZone: this.config.timezone,
        weekday: "short",
      }).format(now);

      // Convert day name to number
      const dayMap: { [key: string]: number } = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };

      const currentDayOfWeek = dayMap[localDay];

      // Find schedule for current day
      const todaySchedule = this.config.schedule.find(
        (s) => s.dayOfWeek === currentDayOfWeek,
      );

      if (!todaySchedule) {
        this.logger.warn(`No schedule found for day ${currentDayOfWeek}`);
        return false;
      }

      // Compare times
      const currentMinutes = this.timeToMinutes(localTime);
      const openMinutes = this.timeToMinutes(todaySchedule.openTime);
      const closeMinutes = this.timeToMinutes(todaySchedule.closeTime);

      const isCurrentlyOpen =
        currentMinutes >= openMinutes && currentMinutes < closeMinutes;

      this.logger.debug(
        `Business hours check: Day=${localDay} Time=${localTime} Open=${todaySchedule.openTime}-${todaySchedule.closeTime} Status=${isCurrentlyOpen ? "OPEN" : "CLOSED"}`,
      );

      return isCurrentlyOpen;
    } catch (error) {
      this.logger.error("Error checking business hours:", error.message);
      // Default to open on error to avoid blocking legitimate messages
      return true;
    }
  }

  /**
   * Get the appropriate closed message
   * @param systemOffline - whether the system is offline vs just outside hours
   * @returns the message to send
   */
  getClosedMessage(systemOffline: boolean = false): string {
    return systemOffline
      ? this.config.offlineMessage
      : this.config.closedMessage;
  }

  /**
   * Check if we should use WhatsApp template for closed hours
   */
  shouldUseTemplate(): boolean {
    return this.config.useTemplateWhenClosed && !!this.config.templateName;
  }

  /**
   * Get the template name to use when closed
   */
  getTemplateName(): string | undefined {
    return this.config.templateName;
  }

  /**
   * Get business hours information for display
   */
  getScheduleInfo(): {
    timezone: string;
    schedule: BusinessHours[];
    formattedSchedule: string;
  } {
    const formattedSchedule = this.formatSchedule();

    return {
      timezone: this.config.timezone,
      schedule: this.config.schedule,
      formattedSchedule,
    };
  }

  /**
   * Convert time string "HH:mm" to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format schedule for human-readable display
   */
  private formatSchedule(): string {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Group consecutive days with same hours
    const groups: Array<{
      days: number[];
      openTime: string;
      closeTime: string;
    }> = [];

    for (const schedule of this.config.schedule) {
      const lastGroup = groups[groups.length - 1];

      if (
        lastGroup &&
        lastGroup.openTime === schedule.openTime &&
        lastGroup.closeTime === schedule.closeTime
      ) {
        lastGroup.days.push(schedule.dayOfWeek);
      } else {
        groups.push({
          days: [schedule.dayOfWeek],
          openTime: schedule.openTime,
          closeTime: schedule.closeTime,
        });
      }
    }

    return groups
      .map((group) => {
        const dayRange =
          group.days.length === 1
            ? days[group.days[0]]
            : group.days.length === 7
              ? "Todos los días"
              : `${days[group.days[0]]} - ${days[group.days[group.days.length - 1]]}`;

        return `${dayRange}: ${group.openTime} - ${group.closeTime}`;
      })
      .join("\n");
  }
}
