document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Reset activity select options
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = details.description || "";
        activityCard.appendChild(desc);

        const pSchedule = document.createElement("p");
        const strongSchedule = document.createElement("strong");
        strongSchedule.textContent = "Schedule: ";
        pSchedule.appendChild(strongSchedule);
        pSchedule.appendChild(document.createTextNode(details.schedule || ""));
        activityCard.appendChild(pSchedule);

        const spotsLeft = (details.max_participants || 0) - ((details.participants && details.participants.length) || 0);
        const pAvailability = document.createElement("p");
        const strongAvail = document.createElement("strong");
        strongAvail.textContent = "Availability: ";
        pAvailability.appendChild(strongAvail);
        pAvailability.appendChild(document.createTextNode(`${spotsLeft} spots left`));
        activityCard.appendChild(pAvailability);

        // Participants section (list without bullets and delete button)
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";
        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants:";
        participantsDiv.appendChild(participantsTitle);

        const participants = Array.isArray(details.participants) ? details.participants : [];
        if (participants.length > 0) {
          const ul = document.createElement("ul");
          participants.forEach((participant) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const span = document.createElement("span");
            span.textContent = participant;
            li.appendChild(span);

            const btn = document.createElement("button");
            btn.className = "delete-btn";
            btn.title = "Unregister participant";
            btn.type = "button";
            btn.textContent = "✖";
            btn.addEventListener("click", async () => {
              try {
                const resp = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants/${encodeURIComponent(participant)}`,
                  { method: "DELETE" }
                );
                const data = await resp.json();
                if (resp.ok) {
                  messageDiv.textContent = data.message;
                  messageDiv.className = "success";
                  messageDiv.classList.remove("hidden");
                  // Refresh activities to update UI
                  fetchActivities();
                  setTimeout(() => messageDiv.classList.add("hidden"), 5000);
                } else {
                  messageDiv.textContent = data.detail || "An error occurred";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => messageDiv.classList.add("hidden"), 5000);
                }
              } catch (err) {
                messageDiv.textContent = "Failed to unregister. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
              }
            });
            li.appendChild(btn);
            ul.appendChild(li);
          });
          participantsDiv.appendChild(ul);
        } else {
          const noneP = document.createElement("p");
          noneP.className = "none";
          noneP.textContent = "No participants yet.";
          participantsDiv.appendChild(noneP);
        }
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities to reflect the new signup
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
