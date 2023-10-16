$(document).ready(function () {
  // Initialize the datepicker for the "start_date" input
  $("#start_date").datepicker({
    dateFormat: "yy-mm-dd", // Set the desired date format
    onSelect: function (selectedDate) {
      // When a date is selected in "start_date," update the "end_date" datepicker's minDate
      $("#end_date").datepicker("option", "minDate", selectedDate);
      updateMonthYear();
    },
  });

  // Initialize the datepicker for the "end_date" input
  $("#end_date").datepicker({
    dateFormat: "yy-mm-dd", // Set the desired date format
    beforeShowDay: function (date) {
      // If start date is not selected, disable all dates
      var startDate = $("#start_date").datepicker("getDate");
      if (!startDate) {
        return [false, ""];
      }

      // Check if the date is within the range
      return [date >= startDate, ""];
    },

    onSelect: function (selectedDate) {
      // Update the "Month, Year" field
      updateMonthYear();
      $("#number-of-days").text(calculateNumberOfDays());
    },
  });

  // Array to store excluded dates
  var excludedDates = [];

  // Initialize the datepicker for the "datePick" input to allow selecting multiple dates
  $(".datepick-input").multiDatesPicker({
    dateFormat: "yy-mm-dd",
    maxPicks: 31, // Limit the number of selectable dates if needed
    onSelect: function (dateText) {
      // Add selected date to the excludedDates array
      var date = new Date(dateText);
      var dateToPush = date.getDate();

      // Toggle the date in the excludedDates array
      var index = excludedDates.indexOf(dateToPush);
      if (index !== -1) {
        excludedDates.splice(index, 1);
      } else {
        excludedDates.push(dateToPush);
      }

      $("#number-of-days").text(calculateNumberOfDays());
    },
    beforeShowDay: function (date) {
      var startDate = $("#start_date").datepicker("getDate");
      var endDate = $("#end_date").datepicker("getDate");

      if (startDate && endDate) {
        // Check if the date is within the range
        return [date >= startDate && date <= endDate, ""];
      }

      // If start and end dates are not selected, disable all dates
      return [false, ""];
    },
  });

  function updateMonthYear() {
    // Get the selected start and end dates
    var startDate = $("#start_date").datepicker("getDate");
    var endDate = $("#end_date").datepicker("getDate");

    if (startDate && endDate) {
      var startMonth = $.datepicker.formatDate("MM yy", startDate);
      var endMonth = $.datepicker.formatDate("MM yy", endDate);

      // Check if the start and end months are the same
      if (startMonth === endMonth) {
        // Display just one month if they are the same
        $("#month-year").text(startMonth);
        return startMonth;
      } else {
        // Display both months if they are different
        $("#month-year").text(startMonth + " - " + endMonth);
        return startMonth + " - " + endMonth;
      }
    } else {
      // If either date is not selected, clear the "Month, Year" cell
      $("#month-year").text("");
      return "";
    }
  }
  // Function to calculate the number of days after excluding specified dates

  function calculateNumberOfDays() {
    var startingDate = $("#start_date").datepicker("getDate");
    var endingDate = $("#end_date").datepicker("getDate");
  
    if (!startingDate || !endingDate) {
      return 0;
    }
  
    var numberOfDays = 0;
    var currentDate = new Date(startingDate);
  
    while (currentDate <= endingDate) {
      var currentMonth = currentDate.getMonth();
      numberOfDays++;
  
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
  
      // Check if we have moved to the next month
      if (currentDate.getMonth() !== currentMonth) {
        if (currentDate <= endingDate) {
          numberOfDays++; // Count the day in the next month
        }
      }
    }
  
    // Subtract the excluded dates
    numberOfDays -= excludedDates.length;
  
    return numberOfDays;
  }
  
  // Attach an input event listener to the lead count input field
  $("#lead_count").on("input", function () {
    var leadCount = $("#lead_count").val(); // Get the lead count entered by the user
    var numberOfDays = calculateNumberOfDays();
    $("#expected-drr").text(calculateExpectedDRR(leadCount, numberOfDays));
  });

  // Function to calculate the expected DRR based on lead count and number of days
  function calculateExpectedDRR(leadCount, numberOfDays) {
    if (numberOfDays === 0) {
      return 0; // Avoid division by zero
    }

    var expectedDRR = leadCount / numberOfDays;

    // Check if it's a whole number (no decimal)
    if (expectedDRR === Math.floor(expectedDRR)) {
        return Math.floor(expectedDRR); // Show as a whole number
    } else {
        return expectedDRR.toFixed(4); // Show as a decimal with 4 decimal places
    }
  }

  // Save button click event
  $("#drr-calculator tbody").on("click", "#Save-button", function () {
    // Get the values from the input fields
    let id = $(this).closest("tr").find("#id_value").val();
    var startDate = $(this).closest("tr").find("#start_date").val();
    var endDate = $(this).closest("tr").find("#end_date").val();

    var leadCount = $(this).closest("tr").find("#lead_count").val();

    var monthYearText = updateMonthYear();
    // Calculate the number of days after excluding the specified dates
    var numberOfDays = calculateNumberOfDays();
    // Calculate the expected DRR
    var expectedDRR = calculateExpectedDRR(leadCount, numberOfDays);
    if (excludedDates.length === 0) {
      var datePick = "None";
    } else {
      var datePick = $(this).closest("tr").find("#datePick").val();
    }

    var lastUpdate = new Date().toLocaleString();

    // Create a new row
    var newRow = $("<tr></tr>");
    newRow.append(
      '<td><button class="edit-button">Edit</button> <button class="delete-button">Delete</button></td>'
    );
    newRow.append("<td>" + id + "</td>");
    newRow.append("<td>" + startDate + "</td>");
    newRow.append("<td>" + endDate + "</td>");
    newRow.append("<td>" + monthYearText + "</td>");

    newRow.append("<td>" + datePick + "</td>");
    newRow.append("<td>" + numberOfDays + "</td>");
    newRow.append("<td>" + leadCount + "</td>");
    newRow.append("<td>" + expectedDRR + "</td>");
    newRow.append("<td>" + lastUpdate + "</td>");

    // Insert the new row after the first row (header row)
    $("#drr-calculator tbody tr:first").after(newRow);
    // Clear the input fields
    $(this).closest("tr").find("input[type='text']").val("");
  $(this).closest("tr").find(".datepick-input").multiDatesPicker("resetDates");
  $("#number-of-days").text(""); // Clear the number-of-days cell
  $("#expected-drr").text(""); // Clear the expected-drr cell
  $("#month-year").text(""); // Clear the month-year cell
  });
  $("#drr-calculator tbody").on("click", "#Cancel-button", function () {
  
    $(this).closest("tr").find("input[type='text']").val("");
    $(this).closest("tr").find(".datepick-input").multiDatesPicker("resetDates");
    $("#number-of-days").text(""); // Clear the number-of-days cell
    $("#expected-drr").text(""); // Clear the expected-drr cell
    $("#month-year").text(""); // Clear the month-year cell
  });
  // Handle "Delete" button click
  $("#drr-calculator tbody").on("click", ".delete-button", function () {
    var row = $(this).closest("tr");
    row.remove(); // Remove the row when "Delete" is clicked
  });
});
