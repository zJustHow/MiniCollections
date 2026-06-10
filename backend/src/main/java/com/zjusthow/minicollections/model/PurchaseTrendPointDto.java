package com.zjusthow.minicollections.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseTrendPointDto(
        LocalDate date,
        BigDecimal amount,
        BigDecimal cumulativeTotal
) {}
