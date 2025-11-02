import React from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Add, Remove, ExpandMore } from "@mui/icons-material";

interface Slot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  slots: Slot[];
}

interface Props {
  form: { availability: DayAvailability[] };
  handleSlotChange: (
    dayIndex: number,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) => void;
  addSlot: (dayIndex: number) => void;
  removeSlot: (dayIndex: number, slotIndex: number) => void;
}

const WeeklyAvailabilityAccordion: React.FC<Props> = ({
  form,
  handleSlotChange,
  addSlot,
  removeSlot,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Accordion >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: "#79f3a1ff",
          
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>Weekly Availability</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {form.availability.map((day, dayIndex) => (
        <Accordion
          key={day.day}
          sx={{
            mb: 1,
            borderRadius: 2,
            boxShadow: 2,
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: "#f5f5f5",
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            <Typography sx={{ fontWeight: 500 }}>{day.day}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            {day.slots.map((slot, slotIndex) => (
              <Grid
                container
                spacing={1}
                alignItems="center"
                key={slotIndex}
                sx={{ mb: 1 }}
              >
                <Grid  size={{xs:5}}>
                  <TextField
                    type="time"
                    label="Start"
                    value={slot.start}
                    fullWidth
                    onChange={(e) =>
                      handleSlotChange(dayIndex, slotIndex, "start", e.target.value)
                    }
                  />
                </Grid>
                <Grid  size={{xs:5}}>
                  <TextField
                    type="time"
                    label="End"
                    value={slot.end}
                    fullWidth
                    onChange={(e) =>
                      handleSlotChange(dayIndex, slotIndex, "end", e.target.value)
                    }
                  />
                </Grid>
                <Grid  size={{xs:2}}>
                  <IconButton
                    onClick={() => removeSlot(dayIndex, slotIndex)}
                    size="small"
                    color="error"
                  >
                    <Remove />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={() => addSlot(dayIndex)}
              startIcon={<Add />}
            >
              Add Slot
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
        </AccordionDetails>
      </Accordion>
      
    </Box>
  );
};

export default WeeklyAvailabilityAccordion;